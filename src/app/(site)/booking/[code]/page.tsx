import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CheckCircle2, Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { getLocale } from "@/lib/locale";
import { getDict, fmt } from "@/lib/i18n";
import { formatMoney } from "@/lib/money";
import { utcDateToDateStr } from "@/lib/timezone";
import { CopyCode } from "@/components/CopyCode";

export default async function BookingConfirmationPage({ params }: PageProps<"/booking/[code]">) {
  const { code } = await params;
  const [booking, settings, locale] = await Promise.all([
    prisma.booking.findUnique({
      where: { code },
      include: { customer: true, items: { include: { addons: true } } },
    }),
    getSettings(),
    getLocale(),
  ]);
  if (!booking) notFound();
  const d = getDict(locale);

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <div className="card fade-up overflow-hidden">
        <div className="bg-slate-950 px-8 py-10 text-center text-white">
          <div className="pop-in mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 ring-1 ring-emerald-400/40">
            <CheckCircle2 className="h-7 w-7 text-emerald-400" />
          </div>
          <h1 className="mt-4 text-2xl font-bold">{d.confirmation.received}</h1>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-slate-400">
            {fmt(d.confirmation.thanks, { name: booking.customer.firstName })}
          </p>
          <div className="mt-6">
            <CopyCode code={booking.code} />
          </div>
        </div>

        <div className="px-8 py-8">
          <ol className="relative space-y-6 border-s-2 border-slate-100 ps-6">
            <li className="relative">
              <span className="absolute -start-[31px] flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 ring-4 ring-emerald-100">
                <CheckCircle2 className="h-3 w-3 text-white" />
              </span>
              <p className="text-sm font-semibold">{d.confirmation.submitted}</p>
              <p className="text-xs text-slate-400">{booking.createdAt.toUTCString().slice(5, 22)}</p>
            </li>
            <li className="relative">
              <span className="absolute -start-[31px] flex h-5 w-5 items-center justify-center rounded-full bg-sky-500 ring-4 ring-sky-100">
                <Clock className="h-3 w-3 animate-pulse text-white" />
              </span>
              <p className="text-sm font-semibold">
                {d.confirmation.review} <span className="font-normal text-sky-600">{d.confirmation.inProgress}</span>
              </p>
              <p className="text-xs text-slate-400">
                {settings.holdPending
                  ? fmt(d.confirmation.holdNote, { h: settings.holdHours })
                  : d.confirmation.noHoldNote}
              </p>
            </li>
            <li className="relative">
              <span className="absolute -start-[31px] h-5 w-5 rounded-full bg-slate-200 ring-4 ring-slate-50" />
              <p className="text-sm font-semibold text-slate-400">{d.confirmation.confirmedStep}</p>
              <p className="text-xs text-slate-300">{d.confirmation.contacted}</p>
            </li>
          </ol>

          <div className="mt-8 rounded-2xl bg-slate-50 p-5">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold">
                {utcDateToDateStr(booking.bookingDate)}
                {booking.requestedTime ? ` · ${booking.requestedTime}` : ` · ${d.confirmation.allDay}`}
              </span>
              <span className="text-slate-500">
                {booking.items.length} {d.confirmation.servicesCount}
              </span>
            </div>
            {booking.eventAddress && (
              <p className="mt-2 flex items-start gap-1.5 text-sm text-slate-600">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />
                <span>
                  <span className="font-medium">{d.confirmation.addressLabel}: </span>
                  {booking.eventAddress}
                </span>
              </p>
            )}
            <ul className="mt-3 space-y-3">
              {booking.items.map((item) => (
                <li key={item.id} className="text-sm">
                  <div className="flex justify-between font-medium">
                    <span>{item.serviceName} — {item.packageName}</span>
                    <span>{formatMoney(item.packagePrice, booking.currency)}</span>
                  </div>
                  {item.addons.map((a) => (
                    <div key={a.id} className="mt-0.5 flex justify-between text-slate-500">
                      <span className="ps-3">· {a.addonName} × {a.quantity}</span>
                      <span>{formatMoney(a.lineTotal, booking.currency)}</span>
                    </div>
                  ))}
                </li>
              ))}
            </ul>
            <div className="mt-4 flex justify-between border-t border-slate-200 pt-3 text-base font-bold">
              <span>{d.common.total}</span>
              <span>{formatMoney(booking.total, booking.currency)}</span>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm text-slate-500">
            {settings.phone && <span className="flex items-center gap-1.5"><Phone className="h-4 w-4" /> {settings.phone}</span>}
            {settings.whatsapp && <span className="flex items-center gap-1.5"><MessageCircle className="h-4 w-4" /> {settings.whatsapp}</span>}
            {settings.email && <span className="flex items-center gap-1.5"><Mail className="h-4 w-4" /> {settings.email}</span>}
          </div>

          <div className="mt-8 text-center">
            <Link href="/" className="btn btn-outline">
              {d.confirmation.backHome} <ArrowRight className="h-4 w-4 rtl:-scale-x-100" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
