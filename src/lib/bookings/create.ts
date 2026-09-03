import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { computeAddonLine, computeTotal } from "@/lib/pricing";
import { countActiveHolds, hasOverlap } from "@/lib/availability";
import { isValidSlot } from "@/lib/slots";
import { expireStaleHolds } from "@/lib/bookings/status";
import { dateStrToUtcDate, isoWeekdayOf, todayInZone, zonedWallTimeToUtc } from "@/lib/timezone";
import type { BookingInput } from "@/lib/validation";

export class BookingRejection extends Error {
  constructor(
    public readonly kind: "DATE_UNAVAILABLE" | "CLOSED" | "BLOCKED" | "PAST" | "INVALID_ITEM" | "QUANTITY" | "TIME",
    message: string
  ) {
    super(message);
  }
}

export function normalizePhone(phone: string): string {
  const trimmed = phone.trim();
  if (trimmed.startsWith("+")) return "+" + trimmed.slice(1).replace(/[\s\-().]/g, "");
  return trimmed.replace(/[\s\-().]/g, "");
}

export async function createBooking(input: BookingInput): Promise<{ code: string; id: string }> {
  // Release any expired holds first so the day-hold unique index cannot
  // deadlock dates behind abandoned PENDING requests (belt + braces with cron).
  await expireStaleHolds();
  const settings = await getSettings();
  const today = todayInZone(settings.timezone);

  if (input.date <= today) throw new BookingRejection("PAST", "The selected date must be in the future.");
  if (!settings.workingDays.includes(isoWeekdayOf(input.date)))
    throw new BookingRejection("CLOSED", "The business is closed on the selected date.");

  const blocked = await prisma.blockedDate.findUnique({ where: { date: dateStrToUtcDate(input.date) } });
  if (blocked) throw new BookingRejection("BLOCKED", `This date is blocked: ${blocked.reason}`);

  const packageIds = input.items.map((i) => i.packageId);
  const addonIds = input.items.flatMap((i) => i.addons.map((a) => a.addonId));

  const packages = await prisma.servicePackage.findMany({
    where: { id: { in: packageIds }, active: true, archivedAt: null, service: { active: true, archivedAt: null } },
    include: { service: true, addons: { include: { addon: true } } },
  });
  const pkgMap = new Map(packages.map((p) => [p.id, p]));

  const addons = await prisma.addon.findMany({ where: { id: { in: addonIds }, active: true, archivedAt: null } });
  const addonMap = new Map(addons.map((a) => [a.id, a]));

  let subtotal = 0;
  const itemData: {
    serviceId: string;
    serviceName: string;
    packageId: string;
    packageName: string;
    packagePrice: number;
    quantity: number;
    lineTotal: number;
    addons: { addonId: string; addonName: string; addonPrice: number; quantity: number; lineTotal: number }[];
  }[] = [];

  for (const item of input.items) {
    const pkg = pkgMap.get(item.packageId);
    if (!pkg) throw new BookingRejection("INVALID_ITEM", "A selected package is no longer available.");
    subtotal += pkg.price;

    const lines = [];
    for (const sel of item.addons) {
      const link = pkg.addons.find((l) => l.addonId === sel.addonId);
      if (!link) throw new BookingRejection("INVALID_ITEM", `Add-on "${sel.addonId}" is not available for ${pkg.name}.`);
      const addon = addonMap.get(sel.addonId);
      if (!addon) throw new BookingRejection("INVALID_ITEM", "An add-on is no longer available.");
      const qty = addon.allowQuantity ? sel.quantity : Math.min(sel.quantity, 1);
      if (qty < addon.minQuantity || qty > addon.maxQuantity)
        throw new BookingRejection("QUANTITY", `Quantity for "${addon.name}" must be between ${addon.minQuantity} and ${addon.maxQuantity}.`);
      lines.push({ addonId: addon.id, addonName: addon.name, addonPrice: addon.price, quantity: qty, lineTotal: computeAddonLine({ price: addon.price, quantity: qty }) });
    }

    const addonTotal = lines.reduce((s, l) => s + l.lineTotal, 0);
    itemData.push({
      serviceId: pkg.serviceId,
      serviceName: pkg.service.name,
      packageId: pkg.id,
      packageName: pkg.name,
      packagePrice: pkg.price,
      quantity: 1,
      lineTotal: pkg.price + addonTotal,
      addons: lines,
    });
  }

  const total = computeTotal(subtotal, itemData.flatMap((i) => i.addons.map((a) => ({ price: a.addonPrice, quantity: a.quantity }))));

  const [y, m, d] = input.date.split("-").map(Number);
  const durationMinutes = Math.max(...itemData.map((i) => pkgMap.get(i.packageId)!.service.durationMinutes), 60);

  if (!isValidSlot(input.time, settings.openTime, settings.closeTime, durationMinutes)) {
    throw new BookingRejection(
      "TIME",
      `Please choose a start time within working hours (${settings.openTime}–${settings.closeTime}) that fits the full ${Math.round(durationMinutes / 60)}h session.`
    );
  }
  const [th, tm] = input.time.split(":").map(Number);
  const startsAt = zonedWallTimeToUtc(y, m, d, th, tm, settings.timezone);
  const endsAt = new Date(startsAt.getTime() + durationMinutes * 60_000);

  const phone = normalizePhone(input.phone);
  const customer = await prisma.customer.upsert({
    where: { phone },
    update: { firstName: input.firstName, lastName: input.lastName, ...(input.email ? { email: input.email } : {}) },
    create: { firstName: input.firstName, lastName: input.lastName, phone, email: input.email || null },
  });

  try {
    return await prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${input.date})::bigint)`;

      const holds = await countActiveHolds(input.date, settings, tx);
      if (holds >= settings.maxBookingsPerDay)
        throw new BookingRejection("DATE_UNAVAILABLE", "This date is already booked. Please choose another date.");
      if (input.time && (await hasOverlap(startsAt, endsAt, input.date, settings, tx)))
        throw new BookingRejection("DATE_UNAVAILABLE", "This time slot overlaps an existing booking. Please choose another time.");

      const seq = await tx.$queryRaw<{ nextval: bigint }[]>`SELECT nextval('booking_code_seq') AS nextval`;
      const code = `BK-${new Date().getFullYear()}-${String(Number(seq[0].nextval)).padStart(4, "0")}`;

      const booking = await tx.booking.create({
        data: {
          code,
          customerId: customer.id,
          bookingDate: dateStrToUtcDate(input.date),
          startsAt,
          endsAt,
          requestedTime: input.time,
          status: "PENDING",
          subtotal,
          total,
          currency: settings.currency,
          notes: input.notes || null,
          eventAddress: input.eventAddress,
          holdExpiresAt: settings.holdPending ? new Date(Date.now() + settings.holdHours * 3_600_000) : new Date(),
          items: {
            create: itemData.map((i) => ({
              serviceId: i.serviceId,
              serviceName: i.serviceName,
              packageId: i.packageId,
              packageName: i.packageName,
              packagePrice: i.packagePrice,
              quantity: i.quantity,
              lineTotal: i.lineTotal,
              addons: { create: i.addons },
            })),
          },
        },
      });

      await tx.notificationOutbox.create({
        data: { bookingId: booking.id, type: "NEW_BOOKING", payload: { code, customer: `${input.firstName} ${input.lastName}`, phone } },
      });

      return { code: booking.code, id: booking.id };
    });
  } catch (e) {
    if (e instanceof BookingRejection) throw e;
    if ((e as { code?: string }).code === "P2002")
      throw new BookingRejection("DATE_UNAVAILABLE", "This date was just taken. Please choose another date.");
    throw e;
  }
}
