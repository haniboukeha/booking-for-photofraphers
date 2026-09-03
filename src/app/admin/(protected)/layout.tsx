import Link from "next/link";
import { Camera, ExternalLink } from "lucide-react";
import { requireAdminPage } from "@/lib/auth/session";
import { AdminNav, AdminLogout } from "@/components/AdminNav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdminPage();

  return (
    <div dir="ltr" className="min-h-screen bg-slate-100 md:flex">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-slate-200 bg-white md:sticky md:top-0 md:flex md:h-screen">
        <div className="flex items-center gap-2 px-5 py-5">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 text-sky-400">
            <Camera className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-bold leading-tight">Admin</p>
            <p className="max-w-36 truncate text-[11px] text-slate-400">{session.email}</p>
          </div>
        </div>
        <AdminNav />
        <div className="border-t border-slate-100 p-3">
          <Link href="/" className="mb-1 block rounded-xl px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-100">
            View site →
          </Link>
          <AdminLogout />
        </div>
      </aside>
      <div className="flex-1">
        <div className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-2.5 md:hidden">
          <Link href="/admin" className="flex items-center gap-2 text-sm font-bold">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 via-cyan-500 to-emerald-500 text-white">
              <Camera className="h-3.5 w-3.5" />
            </span>
            Admin
          </Link>
          <div className="flex items-center gap-1">
            <Link href="/" className="btn btn-ghost btn-sm">
              <ExternalLink className="h-3.5 w-3.5" /> Store
            </Link>
            <AdminLogout />
          </div>
        </div>
        <div className="md:hidden">
          <AdminNav />
        </div>
        <main className="mx-auto max-w-6xl p-4 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
