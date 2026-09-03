import Link from "next/link";
import { Archive, Pencil, Plus } from "lucide-react";
import { prisma } from "@/lib/db";
import { archiveAddon, saveAddon } from "@/app/actions/admin-catalog";
import { Flash } from "@/components/Flash";
import { ImageUpload } from "@/components/ImageUpload";

export default async function AdminAddonsPage({ searchParams }: PageProps<"/admin/addons">) {
  const sp = await searchParams;
  const edit = typeof sp.edit === "string" && sp.edit ? sp.edit : undefined;
  const addons = await prisma.addon.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { packages: true } } },
  });
  const editing = edit ? await prisma.addon.findUnique({ where: { id: edit } }) : null;

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Add-ons</h1>
      <p className="mt-1 text-sm text-slate-500">Optional extras customers can attach to packages.</p>

      <Flash show={sp.saved === "1"} message="Add-on saved." />

      <form action={saveAddon} className="card mt-6 grid gap-4 p-6 sm:grid-cols-2">
        <input type="hidden" name="id" value={editing?.id ?? ""} />
        <h2 className="flex items-center gap-2 font-semibold sm:col-span-2">
          <Plus className="h-4 w-4 text-sky-600" />
          {editing ? `Edit: ${editing.name}` : "New add-on"}
        </h2>
        <label>
          <span className="label">Name</span>
          <input name="name" required defaultValue={editing?.name} className="input" />
        </label>
        <label>
          <span className="label">Price (DZD)</span>
          <input name="price" type="number" min={0} required defaultValue={editing?.price} className="input" />
        </label>
        <label className="sm:col-span-2">
          <span className="label">Description</span>
          <input name="description" defaultValue={editing?.description ?? ""} className="input" />
        </label>
        <div className="sm:col-span-2">
          <ImageUpload name="imageUrl" value={editing?.imageUrl} label="Add-on image" />
        </div>
        <label className="flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" name="allowQuantity" defaultChecked={editing?.allowQuantity ?? false} className="h-4 w-4 accent-sky-600" />
          Allow quantity selection
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label>
            <span className="label">Min qty</span>
            <input name="minQuantity" type="number" min={0} defaultValue={editing?.minQuantity ?? 1} className="input" />
          </label>
          <label>
            <span className="label">Max qty</span>
            <input name="maxQuantity" type="number" min={1} defaultValue={editing?.maxQuantity ?? 1} className="input" />
          </label>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn btn-primary">{editing ? "Save changes" : "Create add-on"}</button>
          {editing && (
            <Link href="/admin/addons" className="btn btn-ghost">Cancel</Link>
          )}
        </div>
      </form>

      <ul className="mt-8 space-y-2">
        {addons.map((a) => (
          <li key={a.id} className={`card flex items-center justify-between gap-4 px-5 py-3 text-sm ${a.archivedAt ? "opacity-50" : ""}`}>
            <span className="min-w-0">
              <span className="font-semibold">{a.name}</span>{" "}
              <span className="text-slate-500">
                — {a.price.toLocaleString()} DZD · {a.allowQuantity ? `qty ${a.minQuantity}–${a.maxQuantity}` : "single"} · {a._count.packages} packages
              </span>
            </span>
            <span className="flex shrink-0 items-center gap-2">
              <Link href={`/admin/addons?edit=${a.id}`} className="btn btn-outline btn-sm">
                <Pencil className="h-3.5 w-3.5" /> Edit
              </Link>
              {!a.archivedAt && (
                <form action={archiveAddon}>
                  <input type="hidden" name="id" value={a.id} />
                  <button className="btn btn-sm text-red-600 ring-1 ring-red-200 hover:bg-red-50">
                    <Archive className="h-3.5 w-3.5" /> Archive
                  </button>
                </form>
              )}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
