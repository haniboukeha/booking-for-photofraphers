"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/session";

export async function addGalleryImage(formData: FormData): Promise<void> {
  await requireAdmin();
  const imageUrl = String(formData.get("imageUrl") || "").trim();
  if (!imageUrl) return;
  const serviceId = String(formData.get("serviceId") || "") || null;
  await prisma.galleryImage.create({
    data: {
      imageUrl,
      altText: String(formData.get("altText") || "") || null,
      serviceId,
      sortOrder: Number(formData.get("sortOrder") || 0),
    },
  });
  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
  redirect("/admin/gallery?saved=1");
}

export async function removeGalleryImage(formData: FormData): Promise<void> {
  await requireAdmin();
  await prisma.galleryImage.delete({ where: { id: String(formData.get("id")) } });
  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
  redirect("/admin/gallery?saved=1");
}
