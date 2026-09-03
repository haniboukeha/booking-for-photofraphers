import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/auth/password";

const prisma = new PrismaClient();

async function main() {
  await prisma.businessSettings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      businessName: "Lumière Studio",
      headline: "Capture Your Most Important Moments.",
      description:
        "Professional photography for weddings, portraits, products and events. Book your experience in minutes.",
      aboutText:
        "For over five years we have been telling stories through images. Our mission is simple: make world-class photography accessible, with a booking process that respects your time.",
      phone: "+213 555 12 34 56",
      email: "hello@lumiere.studio",
      whatsapp: "+213555123456",
      instagram: "@lumiere.studio",
      location: "Algiers, Algeria",
      businessHours: "Sat–Thu 9:00–18:00",
      timezone: "Africa/Algiers",
      workingDays: [1, 2, 3, 4, 5, 6],
      currency: "DZD",
      holdPending: true,
      holdHours: 24,
      maxBookingsPerDay: 1,
    },
  });

  const adminEmail = process.env.ADMIN_EMAIL || "admin@studio.test";
  await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: "Studio Admin",
      passwordHash: await hashPassword(process.env.ADMIN_PASSWORD || "admin12345"),
    },
  });

  const addons: Record<string, { name: string; description: string; price: number; allowQuantity?: boolean; minQuantity?: number; maxQuantity?: number }> = {
    extraHour: { name: "Extra Hour", description: "One additional hour of coverage", price: 5000, allowQuantity: true, minQuantity: 1, maxQuantity: 3 },
    secondPhotographer: { name: "Second Photographer", description: "An additional photographer on site", price: 12000 },
    drone: { name: "Drone Coverage", description: "Aerial photos and video", price: 15000 },
    album: { name: "Printed Album", description: "Hand-bound 30x30cm album", price: 9000 },
    extraPhotos: { name: "Extra Edited Photos", description: "10 additional edited photos", price: 2000, allowQuantity: true, minQuantity: 1, maxQuantity: 10 },
    secondLocation: { name: "Second Location", description: "Travel to an extra shooting location", price: 4000 },
    retouching: { name: "Retouching Pack", description: "Advanced product retouching", price: 6000 },
    highlight: { name: "Video Highlight", description: "3-minute cinematic highlight film", price: 18000 },
  };

  const addonIds: Record<string, string> = {};
  for (const [key, data] of Object.entries(addons)) {
    const row = await prisma.addon.upsert({
      where: { id: addonIds[key] ?? "" },
      update: {},
      create: { ...data, allowQuantity: data.allowQuantity ?? false, minQuantity: data.minQuantity ?? 1, maxQuantity: data.maxQuantity ?? 1 },
    });
    addonIds[key] = row.id;
  }

  const services = [
    {
      slug: "wedding-photography",
      name: "Wedding Photography",
      description: "Full-day storytelling coverage for your wedding, from preparation to the last dance.",
      basePrice: 30000,
      durationMinutes: 480,
      featured: true,
      coverImageUrl: "/gallery/s-wedding.jpg",
      packages: [
        { name: "Basic", price: 30000, description: "Half-day coverage", features: ["4 hours coverage", "1 photographer", "100 edited photos"], addons: ["extraHour", "extraPhotos"] },
        { name: "Standard", price: 55000, description: "Full-day coverage", features: ["6 hours coverage", "1 photographer", "200 edited photos"], addons: ["extraHour", "secondPhotographer", "extraPhotos"] },
        { name: "Premium", price: 80000, description: "Complete experience", features: ["8 hours coverage", "2 photographers", "300 edited photos", "Photo album"], addons: ["extraHour", "secondPhotographer", "drone", "album", "extraPhotos", "highlight"] },
      ],
    },
    {
      slug: "portrait-session",
      name: "Portrait Session",
      description: "Studio or outdoor portrait sessions for individuals, couples and families.",
      basePrice: 8000,
      durationMinutes: 120,
      featured: true,
      coverImageUrl: "/gallery/s-portrait.jpg",
      packages: [
        { name: "Essential", price: 8000, description: "1 hour, 1 location", features: ["1 hour session", "30 edited photos"], addons: ["extraHour", "extraPhotos"] },
        { name: "Deluxe", price: 15000, description: "2 hours, 2 locations", features: ["2 hour session", "80 edited photos", "Outfit changes"], addons: ["extraHour", "secondLocation", "extraPhotos"] },
      ],
    },
    {
      slug: "product-photography",
      name: "Product Photography",
      description: "Clean, conversion-ready product shots for e-commerce and catalogs.",
      basePrice: 20000,
      durationMinutes: 240,
      featured: true,
      coverImageUrl: "/gallery/s-product.jpg",
      packages: [
        { name: "Half Day", price: 20000, description: "Up to 15 products", features: ["4 hour studio session", "Up to 15 products", "White background"], addons: ["retouching"] },
        { name: "Full Day", price: 38000, description: "Up to 40 products", features: ["8 hour studio session", "Up to 40 products", "Lifestyle setups"], addons: ["retouching", "extraHour"] },
      ],
    },
    {
      slug: "event-coverage",
      name: "Event Coverage",
      description: "Conferences, parties and corporate events covered end to end.",
      basePrice: 25000,
      durationMinutes: 240,
      featured: false,
      coverImageUrl: "/gallery/s-event.jpg",
      packages: [
        { name: "Standard", price: 25000, description: "4 hours", features: ["4 hours coverage", "150 edited photos", "Same-week delivery"], addons: ["extraHour", "secondPhotographer", "highlight"] },
      ],
    },
  ];

  for (const svc of services) {
    const service = await prisma.service.upsert({
      where: { slug: svc.slug },
      update: {},
      create: {
        slug: svc.slug,
        name: svc.name,
        description: svc.description,
        basePrice: svc.basePrice,
        durationMinutes: svc.durationMinutes,
        featured: svc.featured,
        coverImageUrl: svc.coverImageUrl,
      },
    });
    for (let i = 0; i < svc.packages.length; i++) {
      const pkg = svc.packages[i];
      const existing = await prisma.servicePackage.findFirst({ where: { serviceId: service.id, name: pkg.name } });
      const created =
        existing ??
        (await prisma.servicePackage.create({
          data: { serviceId: service.id, name: pkg.name, description: pkg.description, price: pkg.price, features: pkg.features, sortOrder: i },
        }));
      for (const key of pkg.addons) {
        await prisma.packageAddon.upsert({
          where: { packageId_addonId: { packageId: created.id, addonId: addonIds[key] } },
          update: {},
          create: { packageId: created.id, addonId: addonIds[key] },
        });
      }
    }
  }

  const imageCount = await prisma.galleryImage.count();
  if (imageCount === 0) {
    const bySlug = await prisma.service.findMany({ where: { slug: { in: ["wedding-photography", "portrait-session", "product-photography", "event-coverage"] } } });
    const sid = Object.fromEntries(bySlug.map((s) => [s.slug, s.id]));
    await prisma.galleryImage.createMany({
      data: [
        { imageUrl: "/gallery/g1.jpg", altText: "Wedding ceremony", serviceId: sid["wedding-photography"], sortOrder: 0 },
        { imageUrl: "/gallery/g2.jpg", altText: "Couple portrait", serviceId: sid["wedding-photography"], sortOrder: 1 },
        { imageUrl: "/gallery/g3.jpg", altText: "Studio portrait", serviceId: sid["portrait-session"], sortOrder: 2 },
        { imageUrl: "/gallery/g4.jpg", altText: "Golden hour", serviceId: sid["portrait-session"], sortOrder: 3 },
        { imageUrl: "/gallery/g5.jpg", altText: "Product still life", serviceId: sid["product-photography"], sortOrder: 4 },
        { imageUrl: "/gallery/g6.jpg", altText: "E-commerce shot", serviceId: sid["product-photography"], sortOrder: 5 },
        { imageUrl: "/gallery/g7.jpg", altText: "Live event", serviceId: sid["event-coverage"], sortOrder: 6 },
        { imageUrl: "/gallery/g8.jpg", altText: "Conference coverage", serviceId: sid["event-coverage"], sortOrder: 7 },
      ],
    });
  }

  console.log("Seed complete. Admin login:", adminEmail, "/ (password from ADMIN_PASSWORD or admin12345)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
