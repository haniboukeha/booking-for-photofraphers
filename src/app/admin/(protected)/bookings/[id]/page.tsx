import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Ban, CheckCircle2, Clock, Mail, MapPin, Phone, Star, User, XCircle } from "lucide-react";
import { prisma } from "@/lib/db";
import { formatMoney } from "@/lib/money";
import { StatusBadge } from "@/components/StatusBadge";
import { Flash } from "@/components/Flash";
import { acceptBooking, rejectBooking, cancelBooking, completeBooking } from "@/app/actions/admin-bookings";

export default async function AdminBookingDetailPage({ params, searchParams }: PageProps<"/admin/bookings/[id]">) {
  const { id } = await params;
  const sp = await searchParams;
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { customer: true, items: { include: { addons: true } } },
  });
  if (!booking) notFound();

  return (
    <div className="max-w-3xl">
      <Link href="/admin/bookings" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" /> All bookings
      </Link>

      <Flash show={sp.updated === "1"} message="Status updated." />

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-mono text-2xl font-bold tracking-tight">{booking.code}</h1>
          <p className="text-sm text-slate-400">Created {booking.createdAt.toUTCString().slice(5, 22)}</p>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="card p-5">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
            <User className="h-3.5 w-3.5" /> Customer
          </p>
          <p className="mt-2 font-semibold">
            {booking.customer.firstName} {booking.customer.lastName}
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
            <Phone className="h-3.5 w-3.5" /> {booking.customer.phone}
          </p>
          {booking.customer.email && <p className="flex items-center gap-1.5 text-sm text-slate-500"><Mail className="h-3.5 w-3.5" /> {booking.customer.email}</p>}
          <Link href={`/admin/customers/${booking.customer.id}`} className="mt-2 inline-block text-xs font-semibold text-sky-700 hover:underline">
            View profile →
          </Link>
        </div>
        <div className="card p-5">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
            <Clock className="h-3.5 w-3.5" /> Schedule
          </p>
          <p className="mt-2 font-semibold">{booking.bookingDate.toISOString().slice(0, 10)}</p>
          <p className="text-sm text-slate-500">
            {booking.requestedTime ? `Requested start ${booking.requestedTime}` : "All day"}
          </p>
          {booking.holdExpiresAt && booking.status === "PENDING" && (
            <p className="mt-1 text-xs font-medium text-sky-600">Hold expires {booking.holdExpiresAt.toISOString().slice(0, 16)}Z</p>
          )}
        </div>
      </div>

      {booking.eventAddress && (
        <div className="card mt-4 p-5">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
            <MapPin className="h-3.5 w-3.5 text-sky-600" /> Event address
          </p>
          <p className="mt-2 text-sm leading-relaxed text-slate-700">{booking.eventAddress}</p>
        </div>
      )}

      {booking.notes && (
        <div className="card mt-4 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Customer notes</p>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">{booking.notes}</p>
        </div>
      )}

      <div className="card mt-4 p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Items (price snapshot)</p>
        {booking.items.map((item) => (
          <div key={item.id} className="mt-4 border-b border-slate-100 pb-4 last:border-0 last:pb-0">
            <p className="font-semibold">
              {item.serviceName} <span className="text-slate-400">—</span> {item.packageName}
            </p>
            <ul className="mt-1.5 space-y-1 text-sm text-slate-600">
              <li className="flex justify-between">
                <span>{item.packageName} package</span>
                <span>{formatMoney(item.packagePrice, booking.currency)}</span>
              </li>
              {item.addons.map((a) => (
                <li key={a.id} className="flex justify-between text-slate-500">
                  <span>· {a.addonName} × {a.quantity}</span>
                  <span>{formatMoney(a.lineTotal, booking.currency)}</span>
                </li>
              ))}
              <li className="flex justify-between font-medium text-slate-700">
                <span>Line total</span>
                <span>{formatMoney(item.lineTotal, booking.currency)}</span>
              </li>
            </ul>
          </div>
        ))}
        <div className="mt-4 flex justify-between border-t border-slate-200 pt-3 text-lg font-bold">
          <span>Total</span>
          <span>{formatMoney(booking.total, booking.currency)}</span>
        </div>
      </div>

      {booking.rejectionReason && (
        <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-100">
          <XCircle className="mr-1 inline h-4 w-4" /> Rejected: {booking.rejectionReason}
        </p>
      )}
      {booking.cancellationReason && (
        <p className="mt-4 rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-600">
          <Ban className="mr-1 inline h-4 w-4" /> Cancelled: {booking.cancellationReason}
        </p>
      )}

      {(booking.status === "PENDING" || booking.status === "CONFIRMED") && (
        <div className="card mt-6 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Actions</p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            {booking.status === "PENDING" && (
              <>
                <form action={acceptBooking}>
                  <input type="hidden" name="id" value={booking.id} />
                  <button className="btn btn-success">
                    <CheckCircle2 className="h-4 w-4" /> Accept booking
                  </button>
                </form>
                <form action={rejectBooking} className="flex flex-1 items-center gap-2 sm:min-w-72">
                  <input type="hidden" name="id" value={booking.id} />
                  <input name="reason" placeholder="Rejection reason (optional)" className="input flex-1" />
                  <button className="btn btn-danger">Reject</button>
                </form>
              </>
            )}
            {booking.status === "CONFIRMED" && (
              <>
                <form action={completeBooking}>
                  <input type="hidden" name="id" value={booking.id} />
                  <button className="btn btn-primary">
                    <Star className="h-4 w-4" /> Mark completed
                  </button>
                </form>
                <form action={cancelBooking} className="flex flex-1 items-center gap-2 sm:min-w-72">
                  <input type="hidden" name="id" value={booking.id} />
                  <input name="reason" placeholder="Cancellation reason (optional)" className="input flex-1" />
                  <button className="btn btn-neutral">Cancel booking</button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
