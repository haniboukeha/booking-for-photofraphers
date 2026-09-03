import { prisma } from "../src/lib/db";

async function main() {
  const covers: Record<string, string> = {
    "wedding-photography": "/gallery/s-wedding.jpg",
    "portrait-session": "/gallery/s-portrait.jpg",
    "product-photography": "/gallery/s-product.jpg",
    "event-coverage": "/gallery/s-event.jpg",
  };
  for (const [slug, url] of Object.entries(covers)) {
    await prisma.service.updateMany({ where: { slug }, data: { coverImageUrl: url } });
  }

  await prisma.galleryImage.deleteMany();
  const wedding = await prisma.service.findUnique({ where: { slug: "wedding-photography" } });
  const portrait = await prisma.service.findUnique({ where: { slug: "portrait-session" } });
  const product = await prisma.service.findUnique({ where: { slug: "product-photography" } });
  const event = await prisma.service.findUnique({ where: { slug: "event-coverage" } });
  await prisma.galleryImage.createMany({
    data: [
      { imageUrl: "/gallery/g1.jpg", altText: "Wedding ceremony", serviceId: wedding?.id, sortOrder: 0 },
      { imageUrl: "/gallery/g2.jpg", altText: "Couple portrait", serviceId: wedding?.id, sortOrder: 1 },
      { imageUrl: "/gallery/g3.jpg", altText: "Studio portrait", serviceId: portrait?.id, sortOrder: 2 },
      { imageUrl: "/gallery/g4.jpg", altText: "Golden hour", serviceId: portrait?.id, sortOrder: 3 },
      { imageUrl: "/gallery/g5.jpg", altText: "Product still life", serviceId: product?.id, sortOrder: 4 },
      { imageUrl: "/gallery/g6.jpg", altText: "E-commerce shot", serviceId: product?.id, sortOrder: 5 },
      { imageUrl: "/gallery/g7.jpg", altText: "Live event", serviceId: event?.id, sortOrder: 6 },
      { imageUrl: "/gallery/g8.jpg", altText: "Conference coverage", serviceId: event?.id, sortOrder: 7 },
    ],
  });
  console.log("images updated");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
