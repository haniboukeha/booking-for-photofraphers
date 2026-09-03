import Link from "next/link";
import { Archive, Pencil, Plus } from "lucide-react";
import { prisma } from "@/lib/db";
import { archivePackage, savePackage } from "@/app/actions/admin-catalog";
import { Flash } from "@/components/Flash";
import { ImageUpload } from "@/components/ImageUpload";

export default async function AdminPackagesPage({ searchParams }: PageProps<"/admin/packages">) {
  const sp = await searchParams;
  const edit = typeof sp.edit === "string" && sp.edit ? sp.edit : undefined;
  const [services, addons, allPackages] = await Promise.all([
    prisma.service.findMany({ where: { archivedAt: null }, orderBy: { createdAt: "asc" } }),
    prisma.addon.findMany({ where: { archivedAt: null, active: true }, orderBy: { name: "asc" } }),
    prisma.servicePackage.findMany({
      orderBy: { sortOrder: "asc" },
      include: { _count: { select: { addons: true } } },
    }),
  ]);
  const editing = edit
    ? await prisma.servicePackage.findUnique({ where: { id: edit }, include: { addons: true } })
    : null;
  const byService = new Map<string, typeof allPackages>();
  for (const p of allPackages) {
    const list = byService.get(p.serviceId) ?? [];
    list.push(p);
    byService.set(p.serviceId, list);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Packages</h1>
      <p className="mt-1 text-sm text-slate-500">Tiered offers per service, with the add-ons each one unlocks.</p>

      <Flash show={sp.saved === "1"} message="Package saved." />

      <form action={savePackage} className="card mt-6 grid gap-4 p-6 sm:grid-cols-2">
        <input type="hidden" name="id" value={editing?.id ?? ""} />
        <h2 className="flex items-center gap-2 font-semibold sm:col-span-2">
          <Plus className="h-4 w-4 text-sky-600" />
          {editing ? `Edit: ${editing.name}` : "New package"}
        </h2>
        <label>
          <span className="label">Service</span>
          <select name="serviceId" required defaultValue={editing?.serviceId ?? services[0]?.id} className="input">
            {services.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </label>
        <label>
          <span className="label">Name</span>
          <input name="name" required defaultValue={editing?.name} placeholder="Premium" className="input" />
        </label>
        <label>
          <span className="label">Price (DZD)</span>
          <input name="price" type="number" min={0} required defaultValue={editing?.price} className="input" />
        </label>
        <label>
          <span className="label">Sort order</span>
          <input name="sortOrder" type="number" defaultValue={editing?.sortOrder ?? 0} className="input" />
        </label>
        <label className="sm:col-span-2">
          <span className="label">Description</span>
          <input name="description" defaultValue={editing?.description ?? ""} className="input" />
        </label>
        <div className="sm:col-span-2">
          <ImageUpload name="imageUrl" value={editing?.imageUrl} label="Package image" />
        </div>
        <label className="sm:col-span-2">
          <span className="label">Included features (one per line)</span>
          <textarea name="featuresText" rows={3} defaultValue={editing?.features.join("\n") ?? ""} className="input resize-y" />
        </label>
        <div className="sm:col-span-2">
          <span className="label">Available add-ons</span>
          <div className="mt-1 grid gap-1.5 rounded-xl bg-slate-50 p-3 sm:grid-cols-3">
            {addons.map((a) => (
              <label key={a.id} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="addonIds"
                  value={a.id}
                  defaultChecked={editing?.addons.some((l) => l.addonId === a.id) ?? false}
                  className="h-4 w-4 accent-sky-600"
                />
                {a.name}
              </label>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn btn-primary">{editing ? "Save changes" : "Create package"}</button>
          {editing && (
            <Link href="/admin/packages" className="btn btn-ghost">Cancel</Link>
          )}
        </div>
      </form>

      <div className="mt-8 space-y-6">
        {services.map((s) => (
          <div key={s.id}>
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-400">{s.name}</h2>
            <ul className="mt-2 space-y-2">
              {(byService.get(s.id) ?? []).map((p) => (
                <li key={p.id} className={`card flex items-center justify-between gap-4 px-5 py-3 text-sm ${p.archivedAt ? "opacity-50" : ""}`}>
                  <span className="min-w-0">
                    <span className="font-semibold">{p.name}</span>{" "}
                    <span className="text-slate-500">— {p.price.toLocaleString()} DZD · {p._count.addons} add-ons</span>
                  </span>
                  <span className="flex shrink-0 items-center gap-2">
                    <Link href={`/admin/packages?edit=${p.id}`} className="btn btn-outline btn-sm">
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </Link>
                    {!p.archivedAt && (
                      <form action={archivePackage}>
                        <input type="hidden" name="id" value={p.id} />
                        <button className="btn btn-sm text-red-600 ring-1 ring-red-200 hover:bg-red-50">
                          <Archive className="h-3.5 w-3.5" /> Archive
                        </button>
                      </form>
                    )}
                  </span>
                </li>
              ))}
              {(byService.get(s.id) ?? []).length === 0 && (
                <li className="rounded-2xl border border-dashed border-slate-300 px-5 py-4 text-sm text-slate-400">
                  No packages yet.
                </li>
              )}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
