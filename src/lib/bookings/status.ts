import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { countActiveHolds } from "@/lib/availability";
import type { BookingStatus } from "@prisma/client";

const TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  PENDING: ["CONFIRMED", "REJECTED", "CANCELLED", "EXPIRED"],
  CONFIRMED: ["COMPLETED", "CANCELLED"],
  REJECTED: [],
  CANCELLED: [],
  COMPLETED: [],
  EXPIRED: [],
};

export function canTransition(from: BookingStatus, to: BookingStatus): boolean {
  return TRANSITIONS[from].includes(to);
}

export class TransitionError extends Error {
  constructor(public readonly kind: "INVALID_TRANSITION" | "DATE_UNAVAILABLE", message: string) {
    super(message);
  }
}

export async function changeStatus(bookingId: string, to: BookingStatus, reason?: string): Promise<void> {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) throw new TransitionError("INVALID_TRANSITION", "Booking not found.");
  if (!canTransition(booking.status, to))
    throw new TransitionError("INVALID_TRANSITION", `Cannot move a ${booking.status} booking to ${to}.`);

  const settings = await getSettings();

  await prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${booking.bookingDate.toISOString().slice(0, 10)})::bigint)`;

    if (to === "CONFIRMED") {
      const holds = await countActiveHolds(booking.bookingDate.toISOString().slice(0, 10), settings, tx);
      const others = holds - (booking.status === "PENDING" && settings.holdPending ? 1 : 0);
      if (others >= settings.maxBookingsPerDay)
        throw new TransitionError("DATE_UNAVAILABLE", "Another booking already holds this date.");
    }

    await tx.booking.update({
      where: { id: bookingId },
      data: {
        status: to,
        holdExpiresAt: to === "PENDING" ? booking.holdExpiresAt : null,
        ...(to === "REJECTED" ? { rejectionReason: reason || null } : {}),
        ...(to === "CANCELLED" ? { cancellationReason: reason || null } : {}),
      },
    });

    await tx.notificationOutbox.create({
      data: { bookingId, type: `BOOKING_${to}`, payload: { code: booking.code, reason: reason ?? null } },
    });
  });
}

export async function expireStaleHolds(): Promise<number> {
  const settings = await getSettings();
  if (!settings.holdPending) return 0;
  const result = await prisma.booking.updateMany({
    where: { status: "PENDING", holdExpiresAt: { lt: new Date() } },
    data: { status: "EXPIRED", holdExpiresAt: null },
  });
  return result.count;
}
