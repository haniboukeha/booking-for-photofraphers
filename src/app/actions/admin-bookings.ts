"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/session";
import { changeStatus, TransitionError } from "@/lib/bookings/status";
import type { BookingStatus } from "@prisma/client";

async function transition(id: string, to: BookingStatus, reason?: string): Promise<void> {
  await requireAdmin();
  try {
    await changeStatus(id, to, reason);
  } catch (e) {
    if (e instanceof TransitionError) {
      console.error(`status transition ${to} rejected for ${id}: ${e.message}`);
    } else {
      throw e;
    }
  }
  revalidatePath("/admin");
  revalidatePath("/admin/bookings");
  revalidatePath("/admin/calendar");
}

export async function acceptBooking(formData: FormData): Promise<void> {
  const id = String(formData.get("id"));
  await transition(id, "CONFIRMED");
  redirect(`/admin/bookings/${id}?updated=1`);
}

export async function rejectBooking(formData: FormData): Promise<void> {
  const id = String(formData.get("id"));
  await transition(id, "REJECTED", String(formData.get("reason") || "") || undefined);
  redirect(`/admin/bookings/${id}?updated=1`);
}

export async function cancelBooking(formData: FormData): Promise<void> {
  const id = String(formData.get("id"));
  await transition(id, "CANCELLED", String(formData.get("reason") || "") || undefined);
  redirect(`/admin/bookings/${id}?updated=1`);
}

export async function completeBooking(formData: FormData): Promise<void> {
  const id = String(formData.get("id"));
  await transition(id, "COMPLETED");
  redirect(`/admin/bookings/${id}?updated=1`);
}
