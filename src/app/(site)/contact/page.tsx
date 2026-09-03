import Link from "next/link";
import { ArrowRight, AtSign, CalendarCheck, Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { getSettings } from "@/lib/settings";
import { getLocale } from "@/lib/locale";
import { getDict } from "@/lib/i18n";

export default async function ContactPage() {
  const [s, locale] = await Promise.all([getSettings(), getLocale()]);
  const d = getDict(locale);
  const cards = [
    { icon: Phone, label: d.contact.phone, value: s.phone },
    { icon: Mail, label: d.contact.email, value: s.email },
    { icon: MessageCircle, label: d.contact.whatsapp, value: s.whatsapp },
    { icon: AtSign, label: d.contact.instagram, value: s.instagram },
    { icon: MapPin, label: d.contact.location, value: s.location },
    { icon: Clock, label: d.contact.hours, value: s.businessHours },
  ].filter((c) => c.value);

  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <p className="eyebrow">{d.contact.eyebrow}</p>
      <h1 className="mt-2 text-4xl font-extrabold tracking-tight md:text-5xl">{d.contact.title}</h1>
      <p className="mt-3 max-w-xl text-slate-500">{d.contact.sub}</p>

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(({ icon: Icon, label, value }) => (
          <div key={label} className="card p-6 transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600 ring-1 ring-sky-200">
              <Icon className="h-5 w-5" />
            </div>
            <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
            <p className="mt-1 font-medium">{value}</p>
          </div>
        ))}
      </div>

      <div className="relative mt-12 overflow-hidden rounded-[2.5rem] bg-slate-950 px-8 py-12 text-center text-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/gallery/g7.jpg" alt="" className="absolute inset-0 h-full w-full object-cover opacity-20" />
        <div className="hero-glow absolute inset-0" />
        <div className="relative">
          <h2 className="text-2xl font-extrabold">{d.contact.fastest}</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-slate-300">{d.contact.fastestText}</p>
          <Link href="/booking" className="btn btn-amber mt-6">
            <CalendarCheck className="h-4 w-4" /> {d.home.ctaCheckDate} <ArrowRight className="h-4 w-4 rtl:-scale-x-100" />
          </Link>
        </div>
      </div>
    </div>
  );
}
