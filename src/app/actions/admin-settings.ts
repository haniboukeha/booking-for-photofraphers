"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";
import { settingsSchema } from "@/lib/validation";

export async function updateSettings(formData: FormData): Promise<void> {
  await requireAdmin();
  const parsed = settingsSchema.safeParse({
    businessName: formData.get("businessName"),
    headline: formData.get("headline") || "",
    description: formData.get("description") || "",
    aboutText: formData.get("aboutText") || "",
    phone: formData.get("phone") || "",
    email: formData.get("email") || "",
    whatsapp: formData.get("whatsapp") || "",
    instagram: formData.get("instagram") || "",
    location: formData.get("location") || "",
    businessHours: formData.get("businessHours") || "",
    openTime: formData.get("openTime"),
    closeTime: formData.get("closeTime"),
    timezone: formData.get("timezone"),
    workingDays: formData.getAll("workingDays").map(Number),
    holdPending: formData.get("holdPending") === "on",
    holdHours: formData.get("holdHours"),
    maxBookingsPerDay: formData.get("maxBookingsPerDay"),
  });
  if (!parsed.success) {
    console.error("updateSettings invalid input", parsed.error.issues[0]?.message);
    return;
  }

  await prisma.businessSettings.upsert({
    where: { id: 1 },
    update: parsed.data,
    create: { id: 1, ...parsed.data },
  });
  revalidatePath("/admin/settings");
  revalidatePath("/", "layout");
  redirect("/admin/settings?saved=1");
}
