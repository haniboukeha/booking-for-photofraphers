import Link from "next/link";
import { ArrowRight, CalendarCheck, Clock, PoundSterling, Users } from "lucide-react";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { formatMoney } from "@/lib/money";
import { datePartsInZone } from "@/lib/timezone";
import { StatusBadge } from "@/components/StatusBadge";

export default async function AdminDashboard() {
  const settings = await getSettings();
  const { dateStr } = datePartsInZone(new Date(), settings.timezone);
  const monthStart = dateStr.slice(0, 7);

  const [total, pending, confirmed, customers, monthAgg, recent] = await Promise.all([
    prisma.booking.count(),
    prisma.booking.count({ where: { status: "PENDING" } }),
    prisma.booking.count({ where: { status: "CONFIRMED" } }),
    prisma.customer.count(),
    prisma.booking.aggregate({
      _sum: { total: true },
      _count: true,
      where: {
        status: { in: ["CONFIRMED", "COMPLETED"] },
        bookingDate: { gte: new Date(monthStart + "-01T00:00:00Z") },
      },
    }),
    prisma.booking.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "asc" },
      take: 6,
      include: { customer: true },
    }),
  ]);

  const stats = [
    { label: "Total bookings", value: total, icon: CalendarCheck, tint: "bg-sky-50 text-sky-600 ring-sky-200" },
    { label: "Pending requests", value: pending, icon: Clock, tint: "bg-sky-50 text-sky-600 ring-sky-200" },
    { label: "Confirmed", value: confirmed, icon: CalendarCheck, tint: "bg-emerald-50 text-emerald-600 ring-emerald-200" },
    { label: "Customers", value: customers, icon: Users, tint: "bg-violet-50 text-violet-600 ring-violet-200" },
    { label: `Revenue (${monthStart})`, value: formatMoney(monthAgg._sum.total ?? 0, settings.currency), icon: PoundSterling, tint: "bg-slate-100 text-slate-700 ring-slate-200" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
      <p className="mt-1 text-sm text-slate-500">Today is {dateStr} ({settings.timezone}).</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map(({ label, value, icon: Icon, tint }) => (
          <div key={label} className="card p-5">
            <div className={`flex h-9 w-9 items-center justify-center rounded-xl ring-1 ${tint}`}>
              <Icon className="h-4.5 w-4.5" />
            </div>
            <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
            <p className="mt-1 text-2xl font-bold tracking-tight">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Awaiting review</h2>
        <Link href="/admin/bookings?status=PENDING" className="flex items-center gap-1 text-sm font-semibold text-sky-700 hover:underline">
          View all <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="card mt-3 overflow-hidden">
        <table className="tbl">
          <thead>
            <tr>
              <th>Code</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Total</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {recent.length === 0 && (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400">
                  <Clock className="mx-auto mb-2 h-6 w-6" />
                  No pending requests — you&apos;re all caught up.
                </td>
              </tr>
            )}
            {recent.map((b) => (
              <tr key={b.id}>
                <td className="font-mono text-xs font-bold text-sky-700">{b.code}</td>
                <td className="font-medium text-slate-900">
                  {b.customer.firstName} {b.customer.lastName}
                </td>
                <td>{b.bookingDate.toISOString().slice(0, 10)}</td>
                <td>{formatMoney(b.total, b.currency)}</td>
                <td><StatusBadge status={b.status} /></td>
                <td className="text-right">
                  <Link href={`/admin/bookings/${b.id}`} className="btn btn-primary btn-sm">
                    Review
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
