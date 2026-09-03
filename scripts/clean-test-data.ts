import { prisma } from "../src/lib/db";

async function main() {
  await prisma.bookingItemAddon.deleteMany();
  await prisma.bookingItem.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.notificationOutbox.deleteMany();
  console.log("test data cleaned");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
