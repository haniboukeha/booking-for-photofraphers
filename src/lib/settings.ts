import { prisma } from "@/lib/db";
import type { BusinessSettings } from "@prisma/client";

export const DEFAULT_SETTINGS: Omit<BusinessSettings, "id" | "updatedAt"> = {
  businessName: "Studio Booking",
  headline: "",
  description: "",
  aboutText: "",
  phone: "",
  email: "",
  whatsapp: "",
  instagram: "",
  location: "",
  businessHours: "",
  openTime: "09:00",
  closeTime: "18:00",
  timezone: "Africa/Algiers",
  workingDays: [1, 2, 3, 4, 5, 6],
  currency: "DZD",
  holdPending: true,
  holdHours: 24,
  maxBookingsPerDay: 1,
};

export async function getSettings(): Promise<BusinessSettings> {
  const row = await prisma.businessSettings.findUnique({ where: { id: 1 } });
  return row ?? { ...DEFAULT_SETTINGS, id: 1, updatedAt: new Date(0) };
}
