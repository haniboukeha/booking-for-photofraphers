import Link from "next/link";
import { Archive, Pencil, Plus } from "lucide-react";
import { prisma } from "@/lib/db";
import { archiveService, saveService } from "@/app/actions/admin-catalog";
import { Flash } from "@/components/Flash";
import { ImageUpload } from "@/components/ImageUpload";

export default async function AdminServicesPage({ searchParams }: PageProps<"/admin/services">) {
  const sp = await searchParams;
  const edit = typeof sp.edit === "string" && sp.edit ? sp.edit : undefined;
  const [services] = await Promise.all([
    prisma.service.findMany({
      orderBy: { createdAt: "asc" },
      include: { _count: { select: { packages: true } } },
    }),
  ]);
  const editing = edit ? await prisma.service.findUnique({ where: { id: edit } }) : null;

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Services</h1>
      <p className="mt-1 text-sm text-slate-500">Create and manage what customers can book. Archiving keeps history intact.</p>

      <Flash show={sp.saved === "1"} message="Service saved." />

      <form action={saveService} className="card mt-6 grid gap-4 p-6 sm:grid-cols-2">
        <input type="hidden" name="id" value={editing?.id ?? ""} />
        <h2 className="flex items-center gap-2 font-semibold sm:col-span-2">
          <Plus className="h-4 w-4 text-sky-600" />
          {editing ? `Edit: ${editing.name}` : "New service"}
        </h2>
        <label>
          <span className="label">Name</span>
          <input name="name" required defaultValue={editing?.name} className="input" />
        </label>
        <label>
          <span className="label">Slug</span>
          <input name="slug" defaultValue={editing?.slug} placeholder="auto from name" className="input" />
        </label>
        <label className="sm:col-span-2">
          <span className="label">Description</span>
          <textarea name="description" required rows={2} defaultValue={editing?.description} className="input resize-y" />
        </label>
        <label>
          <span className="label">Base price (DZD)</span>
          <input name="basePrice" type="number" min={0} required defaultValue={editing?.basePrice} className="input" />
        </label>
        <label>
          <span className="label">Duration (minutes)</span>
          <input name="durationMinutes" type="number" min={15} required defaultValue={editing?.durationMinutes ?? 120} className="input" />
        </label>
        <div className="sm:col-span-2">
          <ImageUpload name="coverImageUrl" value={editing?.coverImageUrl} label="Cover image" />
        </div>
        <label className="flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" name="featured" defaultChecked={editing?.featured ?? false} className="h-4 w-4 accent-sky-600" />
          Featured on landing page
        </label>
        <div className="flex items-center gap-3">
          <button className="btn btn-primary">
            {editing ? "Save changes" : "Create service"}
          </button>
          {editing && (
            <Link href="/admin/services" className="btn btn-ghost">
              Cancel
            </Link>
          )}
        </div>
      </form>

      <ul className="mt-8 space-y-2">
        {services.map((s) => (
          <li key={s.id} className={`card flex items-center justify-between gap-4 px-5 py-4 ${s.archivedAt ? "opacity-50" : ""}`}>
            <div className="min-w-0">
              <p className="truncate font-semibold">
                {s.name}{" "}
                {s.featured && <span className="chip bg-sky-100 text-sky-700">featured</span>}
                {!s.active && <span className="chip bg-slate-200 text-slate-500">archived</span>}
              </p>
              <p className="mt-0.5 text-sm text-slate-500">
                {s._count.packages} packages · from {s.basePrice.toLocaleString()} DZD · /{s.slug}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Link href={`/admin/services?edit=${s.id}`} className="btn btn-outline btn-sm">
                <Pencil className="h-3.5 w-3.5" /> Edit
              </Link>
              {!s.archivedAt && (
                <form action={archiveService}>
                  <input type="hidden" name="id" value={s.id} />
                  <button className="btn btn-sm text-red-600 ring-1 ring-red-200 hover:bg-red-50">
                    <Archive className="h-3.5 w-3.5" /> Archive
                  </button>
                </form>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
