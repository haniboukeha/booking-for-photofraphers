import { prisma } from "../src/lib/db";
import { createBooking, BookingRejection } from "../src/lib/bookings/create";
import { changeStatus, TransitionError, expireStaleHolds } from "../src/lib/bookings/status";
import { getDayInfo } from "../src/lib/availability";
import { todayInZone } from "../src/lib/timezone";

async function main() {
  const d1 = "2027-03-15";
  const d2 = "2027-03-22";
  const d3 = "2027-03-29";

  const pkg = await prisma.servicePackage.findFirstOrThrow({
    where: { service: { slug: "wedding-photography" }, name: "Premium" },
    include: { addons: true },
  });
  const addonId = pkg.addons[0].addonId;

  const input = (date: string, phone: string) => ({
    firstName: "Test",
    lastName: "Customer",
    phone,
    email: "",
    notes: "smoke test",
    time: "10:00",
    eventAddress: "123 Example Street, Algiers",
    date,
    items: [{ packageId: pkg.id, addons: [{ addonId, quantity: 2 }] }],
  });

  // 1. create a booking
  const b1 = await createBooking(input(d1, "+213777000111"));
  console.log("1. created:", b1.code);

  // 1b. booking outside working hours must be rejected
  try {
    await createBooking({ ...input(d1, "+213777000999"), time: "03:00" });
    console.log("1b. FAIL: out-of-hours booking was allowed");
  } catch (e) {
    if (e instanceof BookingRejection && e.kind === "TIME") console.log("1b. out-of-hours rejected:", e.message);
    else throw e;
  }

  // 2. double-booking the same date must be rejected
  try {
    await createBooking(input(d1, "+213777000222"));
    console.log("2. FAIL: double book was allowed");
  } catch (e) {
    if (e instanceof BookingRejection) console.log("2. double-book rejected:", e.message);
    else throw e;
  }

  // 3. concurrent race — exactly one must win
  const results = await Promise.allSettled([
    createBooking(input(d2, "+213777000333")),
    createBooking(input(d2, "+213777000444")),
  ]);
  const wins = results.filter((r) => r.status === "fulfilled").length;
  console.log(`3. race: ${wins} of 2 succeeded —`, wins === 1 ? "PASS" : "FAIL");

  // 4. confirm + availability reflects it
  const b1row = await prisma.booking.findFirstOrThrow({ where: { code: b1.code } });
  await changeStatus(b1row.id, "CONFIRMED");
  const day = await getDayInfo(d1, todayInZone("Africa/Algiers"));
  console.log("4. after confirm, day status:", day.status, day.status === "CONFIRMED" ? "PASS" : "FAIL");

  // 5. rejection releases the slot
  const b3 = await createBooking(input(d3, "+213777000555"));
  const b3row = await prisma.booking.findFirstOrThrow({ where: { code: b3.code } });
  await changeStatus(b3row.id, "REJECTED", "test rejection");
  const b3again = await createBooking(input(d3, "+213777000666"));
  console.log("5. slot released after reject, new booking:", b3again.code);

  // 6. expired holds are swept
  const b4row = await prisma.booking.findFirstOrThrow({ where: { code: b3again.code } });
  await prisma.booking.update({ where: { id: b4row.id }, data: { holdExpiresAt: new Date(Date.now() - 1000) } });
  const expired = await expireStaleHolds();
  console.log("6. expired holds swept:", expired, expired >= 1 ? "PASS" : "FAIL");

  // 7. terminal states cannot transition
  try {
    await changeStatus(b4row.id, "CONFIRMED");
    console.log("7. FAIL: EXPIRED -> CONFIRMED was allowed");
  } catch (e) {
    if (e instanceof TransitionError) console.log("7. invalid transition blocked:", e.message);
    else throw e;
  }

  console.log("SMOKE DONE");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
