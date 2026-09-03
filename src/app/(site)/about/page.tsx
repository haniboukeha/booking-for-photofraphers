import Link from "next/link";
import { ArrowRight, Award, Camera, Heart } from "lucide-react";
import { getSettings } from "@/lib/settings";
import { getLocale } from "@/lib/locale";
import { getDict, fmt } from "@/lib/i18n";
import { tc } from "@/lib/content-i18n";

export default async function AboutPage() {
  const [s, locale] = await Promise.all([getSettings(), getLocale()]);
  const d = getDict(locale);

  const stats = [
    { icon: Award, n: "5+", label: d.home.projects },
    { icon: Heart, n: "500+", label: d.home.clients },
    { icon: Camera, n: "1000+", label: d.home.projects },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <p className="eyebrow">{d.about.eyebrow}</p>
      <h1 className="mt-2 text-4xl font-extrabold tracking-tight md:text-5xl">{fmt(d.about.title, { name: s.businessName })}</h1>
      <p className="mt-6 whitespace-pre-line text-lg leading-relaxed text-slate-600">
        {tc(locale, s.aboutText) || tc(locale, s.description)}
      </p>

      <div className="mt-14 grid gap-6 sm:grid-cols-3">
        {stats.map(({ icon: Icon, n, label }) => (
          <div key={label + n} className="card p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 ring-1 ring-sky-200">
              <Icon className="h-5 w-5" />
            </div>
            <p className="mt-4 text-3xl font-bold">{n}</p>
            <p className="mt-1 text-sm uppercase tracking-wide text-slate-500">{label}</p>
          </div>
        ))}
      </div>

      <div className="relative mt-14 overflow-hidden rounded-[2.5rem] bg-slate-950 px-8 py-12 text-center text-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/gallery/g4.jpg" alt="" className="absolute inset-0 h-full w-full object-cover opacity-20" />
        <div className="hero-glow absolute inset-0" />
        <div className="relative">
          <h2 className="text-2xl font-extrabold">{d.about.ready}</h2>
          <Link href="/services" className="btn btn-amber mt-6">
            {d.about.readyCta} <ArrowRight className="h-4 w-4 rtl:-scale-x-100" />
          </Link>
        </div>
      </div>
    </div>
  );
}
