import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { dateStrToUtcDate, isoWeekdayOf } from "@/lib/timezone";
import type { BusinessSettings, Prisma } from "@prisma/client";

export type DateStatus = "AVAILABLE" | "PENDING" | "CONFIRMED" | "BLOCKED" | "CLOSED" | "PAST";

export interface DayInfo {
  status: DateStatus;
  reason?: string;
  pendingCount: number;
  confirmedCount: number;
}

export function activeHoldWhere(settings: Pick<BusinessSettings, "holdPending">): Prisma.BookingWhereInput {
  return {
    OR: [
      { status: "CONFIRMED" },
      ...(settings.holdPending
        ? [{ status: "PENDING" as const, holdExpiresAt: { gt: new Date() } }]
        : []),
    ],
  };
}

export async function countActiveHolds(dateStr: string, settings: Pick<BusinessSettings, "holdPending">, tx?: Prisma.TransactionClient): Promise<number> {
  const client = tx ?? prisma;
  return client.booking.count({
    where: { bookingDate: dateStrToUtcDate(dateStr), ...activeHoldWhere(settings) },
  });
}

export async function hasOverlap(startsAt: Date, endsAt: Date, dateStr: string, settings: BusinessSettings, tx?: Prisma.TransactionClient): Promise<boolean> {
  const client = tx ?? prisma;
  const count = await client.booking.count({
    where: {
      bookingDate: dateStrToUtcDate(dateStr),
      ...activeHoldWhere(settings),
      startsAt: { lt: endsAt },
      endsAt: { gt: startsAt },
    },
  });
  return count > 0;
}

// Single source of truth for availability (spec §39).
export async function getDayInfo(dateStr: string, todayStr: string, settings?: BusinessSettings): Promise<DayInfo> {
  const s = settings ?? (await getSettings());

  if (dateStr < todayStr) return { status: "PAST", pendingCount: 0, confirmedCount: 0 };
  if (!s.workingDays.includes(isoWeekdayOf(dateStr)))
    return { status: "CLOSED", reason: "Closed", pendingCount: 0, confirmedCount: 0 };

  const blocked = await prisma.blockedDate.findUnique({ where: { date: dateStrToUtcDate(dateStr) } });
  if (blocked) return { status: "BLOCKED", reason: blocked.reason, pendingCount: 0, confirmedCount: 0 };

  const [pending, confirmed] = await Promise.all([
    s.holdPending
      ? prisma.booking.count({ where: { bookingDate: dateStrToUtcDate(dateStr), status: "PENDING", holdExpiresAt: { gt: new Date() } } })
      : Promise.resolve(0),
    prisma.booking.count({ where: { bookingDate: dateStrToUtcDate(dateStr), status: "CONFIRMED" } }),
  ]);

  const holds = pending + confirmed;
  if (holds >= s.maxBookingsPerDay) {
    return confirmed > 0
      ? { status: "CONFIRMED", reason: "Already booked", pendingCount: pending, confirmedCount: confirmed }
      : { status: "PENDING", reason: "Reserved, awaiting confirmation", pendingCount: pending, confirmedCount: confirmed };
  }
  return { status: "AVAILABLE", pendingCount: pending, confirmedCount: confirmed };
}

export async function getMonthDays(year: number, month: number, todayStr: string): Promise<Record<string, DayInfo>> {
  const settings = await getSettings();
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const out: Record<string, DayInfo> = {};
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    out[dateStr] = await getDayInfo(dateStr, todayStr, settings);
  }
  return out;
}
