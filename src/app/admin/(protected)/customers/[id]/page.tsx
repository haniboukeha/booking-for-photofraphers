import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mail, Phone } from "lucide-react";
import { prisma } from "@/lib/db";
import { formatMoney } from "@/lib/money";
import { StatusBadge } from "@/components/StatusBadge";

export default async function AdminCustomerPage({ params }: PageProps<"/admin/customers/[id]">) {
  const { id } = await params;
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: { bookings: { orderBy: { createdAt: "desc" }, include: { items: { select: { serviceName: true } } } } },
  });
  if (!customer) notFound();

  const spend = customer.bookings
    .filter((b) => b.status === "CONFIRMED" || b.status === "COMPLETED")
    .reduce((s, b) => s + b.total, 0);

  return (
    <div className="max-w-3xl">
      <Link href="/admin/customers" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" /> Customers
      </Link>
      <h1 className="mt-3 text-2xl font-bold tracking-tight">
        {customer.firstName} {customer.lastName}
      </h1>
      <p className="mt-1 text-sm text-slate-400">Customer since {customer.createdAt.toISOString().slice(0, 10)}</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="card p-5">
          <p className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-slate-400"><Phone className="h-3.5 w-3.5" /> Phone</p>
          <p className="mt-1.5 font-semibold">{customer.phone}</p>
        </div>
        <div className="card p-5">
          <p className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-slate-400"><Mail className="h-3.5 w-3.5" /> Email</p>
          <p className="mt-1.5 font-semibold">{customer.email ?? "—"}</p>
        </div>
        <div className="card p-5">
          <p className="text-xs uppercase tracking-wide text-slate-400">Lifetime revenue</p>
          <p className="mt-1.5 text-2xl font-bold tracking-tight">{formatMoney(spend, "DZD")}</p>
        </div>
      </div>

      <h2 className="mt-8 text-lg font-semibold">Booking history ({customer.bookings.length})</h2>
      <ul className="mt-3 space-y-2">
        {customer.bookings.map((b) => (
          <li key={b.id} className="card flex flex-wrap items-center justify-between gap-2 px-5 py-3.5 text-sm">
            <span>
              <Link href={`/admin/bookings/${b.id}`} className="font-mono text-xs font-bold text-sky-700 hover:underline">
                {b.code}
              </Link>{" "}
              · {b.items[0]?.serviceName ?? "—"} · {b.bookingDate.toISOString().slice(0, 10)}
            </span>
            <span className="flex items-center gap-3">
              <span className="font-medium">{formatMoney(b.total, b.currency)}</span>
              <StatusBadge status={b.status} />
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
