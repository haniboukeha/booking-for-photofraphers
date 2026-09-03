import { BarChart3, CalendarRange, Layers, Percent, Sparkles, TrendingUp } from "lucide-react";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { formatMoney } from "@/lib/money";

export default async function AdminAnalyticsPage() {
  const settings = await getSettings();

  const [byStatus, items, addonLines, revenueByMonth] = await Promise.all([
    prisma.booking.groupBy({ by: ["status"], _count: true, _sum: { total: true } }),
    prisma.bookingItem.groupBy({ by: ["serviceName"], _count: true, _sum: { lineTotal: true } }),
    prisma.bookingItemAddon.groupBy({ by: ["addonName"], _count: true, _sum: { lineTotal: true } }),
    prisma.booking.groupBy({
      by: ["bookingDate"],
      _sum: { total: true },
      where: { status: { in: ["CONFIRMED", "COMPLETED"] } },
    }),
  ]);

  const statusCounts = new Map(byStatus.map((s) => [s.status, s._count]));
  const totalBookings = byStatus.reduce((s, r) => s + r._count, 0);
  const revenue = byStatus
    .filter((s) => s.status === "CONFIRMED" || s.status === "COMPLETED")
    .reduce((s, r) => s + (r._sum.total ?? 0), 0);
  const decided = (statusCounts.get("CONFIRMED") ?? 0) + (statusCounts.get("REJECTED") ?? 0) + (statusCounts.get("EXPIRED") ?? 0);
  const confirmRate = decided > 0 ? Math.round(((statusCounts.get("CONFIRMED") ?? 0) / decided) * 100) : null;

  const monthly = revenueByMonth
    .map((r) => ({ month: r.bookingDate.toISOString().slice(0, 7), total: r._sum.total ?? 0 }))
    .reduce<Record<string, number>>((acc, r) => {
      acc[r.month] = (acc[r.month] ?? 0) + r.total;
      return acc;
    }, {});
  const monthEntries = Object.entries(monthly).sort().slice(-6);
  const monthMax = Math.max(...monthEntries.map(([, v]) => v), 1);

  const serviceRows = items
    .map((i) => ({ label: i.serviceName, count: i._count, sum: i._sum.lineTotal ?? 0 }))
    .sort((a, b) => b.count - a.count);
  const addonRows = addonLines
    .map((a) => ({ label: a.addonName, count: a._count, sum: a._sum.lineTotal ?? 0 }))
    .sort((a, b) => b.count - a.count);

  const bars = (rows: { label: string; count: number; sum: number }[], max: number) =>
    rows.length === 0 ? (
      <p className="mt-4 text-sm text-slate-400">No data yet.</p>
    ) : (
      <ul className="mt-4 space-y-3">
        {rows.map((r) => (
          <li key={r.label}>
            <div className="flex justify-between text-sm">
              <span className="font-medium">{r.label}</span>
              <span className="text-slate-500">
                {r.count}× · {formatMoney(r.sum, settings.currency)}
              </span>
            </div>
            <div className="mt-1.5 h-2 rounded-full bg-slate-100">
              <div className="h-2 rounded-full bg-gradient-to-r from-sky-500 to-sky-400" style={{ width: `${Math.max(4, (r.count / max) * 100)}%` }} />
            </div>
          </li>
        ))}
      </ul>
    );

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
      <p className="mt-1 text-sm text-slate-500">Revenue counts CONFIRMED + COMPLETED bookings only.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: BarChart3, label: "Total bookings", value: totalBookings, tint: "bg-sky-50 text-sky-600 ring-sky-200" },
          { icon: TrendingUp, label: "Estimated revenue", value: formatMoney(revenue, settings.currency), tint: "bg-emerald-50 text-emerald-600 ring-emerald-200" },
          { icon: Percent, label: "Confirmation rate", value: confirmRate === null ? "—" : `${confirmRate}%`, tint: "bg-sky-50 text-sky-600 ring-sky-200" },
          { icon: CalendarRange, label: "Pending now", value: statusCounts.get("PENDING") ?? 0, tint: "bg-violet-50 text-violet-600 ring-violet-200" },
        ].map(({ icon: Icon, label, value, tint }) => (
          <div key={label} className="card p-5">
            <div className={`flex h-9 w-9 items-center justify-center rounded-xl ring-1 ${tint}`}>
              <Icon className="h-4.5 w-4.5" />
            </div>
            <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
            <p className="mt-1 text-2xl font-bold tracking-tight">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <h2 className="flex items-center gap-2 font-semibold">
            <Layers className="h-4 w-4 text-sky-600" /> Most popular services
          </h2>
          {bars(serviceRows.slice(0, 6), serviceRows[0]?.count ?? 1)}
        </div>
        <div className="card p-6">
          <h2 className="flex items-center gap-2 font-semibold">
            <Sparkles className="h-4 w-4 text-sky-600" /> Most popular add-ons
          </h2>
          {bars(addonRows.slice(0, 6), addonRows[0]?.count ?? 1)}
        </div>
      </div>

      <div className="card mt-6 p-6">
        <h2 className="flex items-center gap-2 font-semibold">
          <TrendingUp className="h-4 w-4 text-sky-600" /> Revenue by month (last 6)
        </h2>
        {monthEntries.length === 0 ? (
          <p className="mt-4 text-sm text-slate-400">No revenue yet.</p>
        ) : (
          <div className="mt-6 flex h-44 items-end gap-3">
            {monthEntries.map(([month, total]) => (
              <div key={month} className="flex flex-1 flex-col items-center gap-1.5">
                <span className="text-xs font-medium text-slate-500">{formatMoney(total, settings.currency)}</span>
                <div
                  className="w-full max-w-16 rounded-t-xl bg-gradient-to-t from-sky-600 to-sky-400 transition hover:from-sky-500"
                  style={{ height: `${Math.max(6, (total / monthMax) * 100)}%` }}
                />
                <span className="text-xs font-semibold text-slate-600">{month}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
