"use server";

import { headers } from "next/headers";
import { createBooking, BookingRejection } from "@/lib/bookings/create";
import { bookingSchema } from "@/lib/validation";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export interface BookingFormState {
  ok: boolean;
  code?: string;
  error?: string;
}

export async function submitBooking(_prev: BookingFormState, formData: FormData): Promise<BookingFormState> {
  const h = await headers();
  if (!rateLimit(`booking:${clientIp(h)}`, 5, 10 * 60 * 1000)) {
    return { ok: false, error: "Too many attempts. Please wait a few minutes and try again." };
  }
  const raw = {
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    date: formData.get("date"),
    time: formData.get("time"),
    eventAddress: formData.get("eventAddress"),
    notes: formData.get("notes"),
  };

  let items: unknown = [];
  try {
    items = JSON.parse(String(formData.get("itemsJson") ?? "[]"));
  } catch {
    return { ok: false, error: "Your cart data is invalid. Please reload the page." };
  }

  const parsed = bookingSchema.safeParse({ ...raw, items });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Please check the form." };
  }

  try {
    const { code } = await createBooking(parsed.data);
    return { ok: true, code };
  } catch (e) {
    if (e instanceof BookingRejection) return { ok: false, error: e.message };
    console.error("booking creation failed", e);
    return { ok: false, error: "Something went wrong. Please try again." };
  }
}
