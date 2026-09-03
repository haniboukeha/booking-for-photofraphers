import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatMoney } from "@/lib/money";
import { StatusBadge } from "@/components/StatusBadge";
import { Search } from "lucide-react";
import type { BookingStatus } from "@prisma/client";

const FILTERS: (BookingStatus | "ALL")[] = ["ALL", "PENDING", "CONFIRMED", "COMPLETED", "REJECTED", "CANCELLED", "EXPIRED"];

export default async function AdminBookingsPage({ searchParams }: PageProps<"/admin/bookings">) {
  const sp = await searchParams;
  const active = (FILTERS.includes(sp.status as BookingStatus) ? sp.status : "ALL") as (typeof FILTERS)[number];
  const q = typeof sp.q === "string" ? sp.q.trim() : "";

  const bookings = await prisma.booking.findMany({
    where: {
      ...(active === "ALL" ? {} : { status: active }),
      ...(q
        ? {
            OR: [
              { code: { contains: q, mode: "insensitive" } },
              { customer: { firstName: { contains: q, mode: "insensitive" } } },
              { customer: { lastName: { contains: q, mode: "insensitive" } } },
              { customer: { phone: { contains: q } } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { customer: true, items: { select: { serviceName: true } } },
  });

  const base = (f: string) => `/admin/bookings?${new URLSearchParams({ ...(f !== "ALL" ? { status: f } : {}), ...(q ? { q } : {}) })}`;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Bookings</h1>
          <p className="mt-1 text-sm text-slate-500">{bookings.length} shown</p>
        </div>
        <form className="relative w-full sm:w-72">
          {active !== "ALL" && <input type="hidden" name="status" value={active} />}
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input name="q" defaultValue={q} placeholder="Search code, name or phone…" className="input pl-10" />
        </form>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f}
            href={f === "ALL" ? `/admin/bookings${q ? `?q=${encodeURIComponent(q)}` : ""}` : base(f)}
            className={`chip transition ${
              f === active ? "bg-slate-900 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100"
            }`}
          >
            {f}
          </Link>
        ))}
      </div>

      <div className="card mt-5 overflow-x-auto">
        <table className="tbl">
          <thead>
            <tr>
              <th>Code</th>
              <th>Customer</th>
              <th>Phone</th>
              <th>Service</th>
              <th>Date</th>
              <th>Total</th>
              <th>Status</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {bookings.length === 0 && (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400">
                  No bookings found.
                </td>
              </tr>
            )}
            {bookings.map((b) => (
              <tr key={b.id}>
                <td>
                  <Link href={`/admin/bookings/${b.id}`} className="font-mono text-xs font-bold text-sky-700 hover:underline">
                    {b.code}
                  </Link>
                </td>
                <td className="font-medium text-slate-900">
                  {b.customer.firstName} {b.customer.lastName}
                </td>
                <td className="text-slate-500">{b.customer.phone}</td>
                <td>
                  {b.items[0]?.serviceName}
                  {b.items.length > 1 && <span className="text-slate-400"> +{b.items.length - 1}</span>}
                </td>
                <td>{b.bookingDate.toISOString().slice(0, 10)}</td>
                <td className="font-medium">{formatMoney(b.total, b.currency)}</td>
                <td><StatusBadge status={b.status} /></td>
                <td className="text-xs text-slate-400">{b.createdAt.toISOString().slice(0, 10)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
