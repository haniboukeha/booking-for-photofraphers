import { ImagePlus, Trash2 } from "lucide-react";
import { prisma } from "@/lib/db";
import { addGalleryImage, removeGalleryImage } from "@/app/actions/admin-gallery";
import { Flash } from "@/components/Flash";
import { ImageUpload } from "@/components/ImageUpload";

export default async function AdminGalleryPage({ searchParams }: PageProps<"/admin/gallery">) {
  const sp = await searchParams;
  const [images, services] = await Promise.all([
    prisma.galleryImage.findMany({ orderBy: { sortOrder: "asc" }, include: { service: { select: { name: true } } } }),
    prisma.service.findMany({ where: { archivedAt: null }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Gallery</h1>
      <p className="mt-1 text-sm text-slate-500">Images shown on the landing page and public gallery.</p>

      <Flash show={sp.saved === "1"} message="Gallery updated." />

      <form action={addGalleryImage} className="card mt-6 grid gap-4 p-6 sm:grid-cols-2">
        <h2 className="flex items-center gap-2 font-semibold sm:col-span-2">
          <ImagePlus className="h-4 w-4 text-sky-600" /> Add image
        </h2>
        <div className="sm:col-span-2">
          <ImageUpload name="imageUrl" label="Image" />
        </div>
        <label>
          <span className="label">Alt text</span>
          <input name="altText" className="input" />
        </label>
        <label>
          <span className="label">Service (optional)</span>
          <select name="serviceId" className="input">
            <option value="">— none —</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </label>
        <label>
          <span className="label">Sort order</span>
          <input name="sortOrder" type="number" defaultValue={images.length} className="input" />
        </label>
        <button className="btn btn-primary justify-self-start">Add image</button>
      </form>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {images.map((img) => (
          <div key={img.id} className="card group overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.imageUrl} alt={img.altText ?? ""} className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-105" />
            <div className="flex items-center justify-between px-3 py-2.5 text-xs">
              <span className="truncate text-slate-500">{img.service?.name ?? img.altText ?? "—"}</span>
              <form action={removeGalleryImage}>
                <input type="hidden" name="id" value={img.id} />
                <button className="text-slate-400 transition hover:text-red-600" aria-label="Remove image">
                  <Trash2 className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
