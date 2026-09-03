"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";
import { addonSchema, packageSchema, serviceSchema } from "@/lib/validation";

function slugify(name: string): string {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export async function saveService(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const parsed = serviceSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug") || slugify(String(formData.get("name") || "")),
    description: formData.get("description"),
    basePrice: formData.get("basePrice"),
    durationMinutes: formData.get("durationMinutes"),
    coverImageUrl: formData.get("coverImageUrl") || "",
    featured: formData.get("featured") === "on",
    active: formData.get("active") !== "off",
  });
  if (!parsed.success) {
    console.error("saveService invalid input", parsed.error.issues[0]?.message);
    return;
  }

  const data = { ...parsed.data, coverImageUrl: parsed.data.coverImageUrl || null };
  if (id) {
    await prisma.service.update({ where: { id }, data });
  } else {
    await prisma.service.create({ data });
  }
  revalidatePath("/admin/services");
  revalidatePath("/services");
  revalidatePath("/");
  redirect("/admin/services?saved=1");
}

export async function archiveService(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id"));
  await prisma.service.update({ where: { id }, data: { active: false, archivedAt: new Date() } });
  revalidatePath("/admin/services");
  revalidatePath("/services");
}

export async function savePackage(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const parsed = packageSchema.safeParse({
    serviceId: formData.get("serviceId"),
    name: formData.get("name"),
    description: formData.get("description") || "",
    imageUrl: formData.get("imageUrl") || "",
    price: formData.get("price"),
    featuresText: formData.get("featuresText") || "",
    addonIds: formData.getAll("addonIds").map(String),
    sortOrder: formData.get("sortOrder") || 0,
    active: formData.get("active") !== "off",
  });
  if (!parsed.success) {
    console.error("savePackage invalid input", parsed.error.issues[0]?.message);
    return;
  }

  const { addonIds = [], featuresText = "", imageUrl, ...rest } = parsed.data;
  const features = featuresText.split("\n").map((f) => f.trim()).filter(Boolean);

  const pkg = id
    ? await prisma.servicePackage.update({ where: { id }, data: { ...rest, features, imageUrl: imageUrl || null } })
    : await prisma.servicePackage.create({ data: { ...rest, features, imageUrl: imageUrl || null } });

  await prisma.packageAddon.deleteMany({ where: { packageId: pkg.id } });
  if (addonIds.length > 0) {
    await prisma.packageAddon.createMany({
      data: addonIds.map((addonId) => ({ packageId: pkg.id, addonId })),
      skipDuplicates: true,
    });
  }
  revalidatePath("/admin/packages");
  revalidatePath("/services");
  redirect("/admin/packages?saved=1");
}

export async function archivePackage(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id"));
  await prisma.servicePackage.update({ where: { id }, data: { active: false, archivedAt: new Date() } });
  revalidatePath("/admin/packages");
}

export async function saveAddon(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const parsed = addonSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || "",
    imageUrl: formData.get("imageUrl") || "",
    price: formData.get("price"),
    allowQuantity: formData.get("allowQuantity") === "on",
    minQuantity: formData.get("minQuantity") || 1,
    maxQuantity: formData.get("maxQuantity") || 1,
    active: formData.get("active") !== "off",
  });
  if (!parsed.success) {
    console.error("saveAddon invalid input", parsed.error.issues[0]?.message);
    return;
  }

  const { imageUrl, ...addonData } = parsed.data;
  if (id) {
    await prisma.addon.update({ where: { id }, data: { ...addonData, imageUrl: imageUrl || null } });
  } else {
    await prisma.addon.create({ data: { ...addonData, imageUrl: imageUrl || null } });
  }
  revalidatePath("/admin/addons");
  redirect("/admin/addons?saved=1");
}

export async function archiveAddon(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id"));
  await prisma.addon.update({ where: { id }, data: { active: false, archivedAt: new Date() } });
  revalidatePath("/admin/addons");
}
