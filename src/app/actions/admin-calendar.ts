"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";
import { blockDateSchema } from "@/lib/validation";
import { dateStrToUtcDate } from "@/lib/timezone";

export async function blockDate(formData: FormData): Promise<void> {
  await requireAdmin();
  const parsed = blockDateSchema.safeParse({
    date: formData.get("date"),
    reason: formData.get("reason"),
    type: formData.get("type"),
  });
  if (!parsed.success) {
    console.error("blockDate invalid input");
    redirect("/admin/calendar");
  }

  const date = dateStrToUtcDate(parsed.data.date);
  const confirmed = await prisma.booking.count({ where: { bookingDate: date, status: "CONFIRMED" } });
  if (confirmed > 0) {
    console.error("blockDate refused: a confirmed booking exists on this date");
    redirect("/admin/calendar");
  }

  await prisma.blockedDate.upsert({
    where: { date },
    update: { reason: parsed.data.reason, type: parsed.data.type },
    create: { date, reason: parsed.data.reason, type: parsed.data.type },
  });
  revalidatePath("/admin/calendar");
  redirect("/admin/calendar?saved=1");
}

export async function unblockDate(formData: FormData): Promise<void> {
  await requireAdmin();
  const date = dateStrToUtcDate(String(formData.get("date")));
  await prisma.blockedDate.deleteMany({ where: { date } });
  revalidatePath("/admin/calendar");
  redirect("/admin/calendar?saved=1");
}
