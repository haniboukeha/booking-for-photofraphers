import Link from "next/link";
import { Aperture, ArrowRight, CalendarCheck, Camera, Clock, Quote, Sparkles, Star, Users } from "lucide-react";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { getLocale } from "@/lib/locale";
import { getDict, fmt } from "@/lib/i18n";
import { tc } from "@/lib/content-i18n";
import { formatMoney } from "@/lib/money";

export default async function HomePage() {
  const [settings, locale, services, images] = await Promise.all([
    getSettings(),
    getLocale(),
    prisma.service.findMany({
      where: { active: true, archivedAt: null, featured: true },
      orderBy: { createdAt: "asc" },
      include: { _count: { select: { packages: true } } },
    }),
    prisma.galleryImage.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" }, take: 8 }),
  ]);
  const d = getDict(locale);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-slate-950 text-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/gallery/hero.jpg" alt="" className="absolute inset-0 h-full w-full object-cover opacity-35" />
        <div className="hero-glow absolute inset-0" />
        <div className="blob float-slow -left-20 top-10 h-72 w-72 bg-sky-500/40" />
        <div className="blob float-slower right-10 bottom-0 h-80 w-80 bg-emerald-500/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
        <div className="relative mx-auto grid max-w-6xl gap-12 px-4 py-28 md:py-36 lg:grid-cols-2 lg:items-center">
          <div className="fade-up">
            <p className="chip d1 bg-white/10 text-sky-300 ring-1 ring-white/20 backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" /> {settings.businessName}
            </p>
            <h1 className="fade-up d1 mt-5 text-4xl font-extrabold leading-[1.08] tracking-tight md:text-6xl">
              {tc(locale, settings.headline) || fmt(d.home.ctaTitle, {})}
            </h1>
            <p className="fade-up d2 mt-3 text-2xl font-bold md:text-3xl">
              <span className="text-gradient">{d.home.howTitle}</span>
            </p>
            <p className="fade-up d2 mt-5 max-w-lg text-lg leading-relaxed text-slate-300">{tc(locale, settings.description)}</p>
            <div className="fade-up d3 mt-9 flex flex-wrap gap-4">
              <Link href="/services" className="btn btn-amber px-7 py-3 text-base">
                {d.home.ctaServices} <ArrowRight className="h-4 w-4 rtl:-scale-x-100" />
              </Link>
              <Link
                href="/booking"
                className="btn border border-white/25 bg-white/5 px-7 py-3 text-base text-white backdrop-blur hover:bg-white/15"
              >
                <CalendarCheck className="h-4 w-4" /> {d.home.ctaCheckDate}
              </Link>
            </div>
            <div className="fade-up d4 mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm text-slate-300">
              <span className="flex items-center gap-2"><Clock className="h-4 w-4 text-sky-400" /> {d.home.replyWithin}</span>
              <span className="flex items-center gap-2"><Users className="h-4 w-4 text-sky-400" /> 500+ {d.home.clients}</span>
              <span className="flex items-center gap-2"><Aperture className="h-4 w-4 text-sky-400" /> 1000+ {d.home.projects}</span>
            </div>
          </div>
          <div className="relative hidden lg:block">
            <div className="grid grid-cols-2 gap-4">
              {images.slice(0, 4).map((img, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={img.id}
                  src={img.imageUrl}
                  alt={img.altText ?? ""}
                  className={`fade-up w-full rounded-3xl object-cover shadow-2xl ring-1 ring-white/15 ${i % 2 === 1 ? "translate-y-8" : ""} ${i === 0 ? "float-slow" : i === 3 ? "float-slower" : ""} d${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="reveal mx-auto max-w-6xl px-4 py-24">
        <div className="flex items-end justify-between">
          <div>
            <p className="eyebrow">{d.home.whatWeDo}</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">{d.home.servicesTitle}</h2>
          </div>
          <Link href="/services" className="hidden items-center gap-1 text-sm font-semibold text-sky-700 hover:underline sm:flex">
            {d.home.allServices} <ArrowRight className="h-4 w-4 rtl:-scale-x-100" />
          </Link>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((s) => (
            <Link
              key={s.id}
              href={`/services/${s.slug}`}
              className="group relative overflow-hidden rounded-3xl shadow-lg transition duration-300 hover:-translate-y-1.5 hover:shadow-2xl"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={s.coverImageUrl ?? "/gallery/g1.jpg"}
                alt={s.name}
                className="h-72 w-full object-cover transition duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/25 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                <span className="chip bg-white/15 text-sky-300 ring-1 ring-white/25 backdrop-blur">
                  {s._count.packages} {d.common.packages}
                </span>
                <h3 className="mt-2 text-lg font-bold">{tc(locale, s.name)}</h3>
                <p className="mt-1 text-sm text-slate-300">
                  {d.common.from} <span className="font-bold text-white">{formatMoney(s.basePrice, settings.currency)}</span>
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="reveal relative overflow-hidden bg-slate-950 text-white">
        <div className="dot-grid absolute inset-0 opacity-60" />
        <div className="relative mx-auto max-w-6xl px-4 py-24">
          <h2 className="text-center text-3xl font-bold tracking-tight md:text-4xl">
            {d.home.howTitle.split(" ")[0]} <span className="text-gradient">{d.home.howTitle.split(" ").slice(1).join(" ")}</span>
          </h2>
          <p className="mx-auto mt-3 max-w-md text-center text-slate-400">{d.home.howSub}</p>
          <div className="mt-14 grid gap-8 sm:grid-cols-3">
            {[
              { icon: Camera, title: d.home.how1t, text: d.home.how1d },
              { icon: CalendarCheck, title: d.home.how2t, text: d.home.how2d },
              { icon: Users, title: d.home.how3t, text: d.home.how3d },
            ].map(({ icon: Icon, title, text }, i) => (
              <div key={title} className="relative rounded-3xl border border-white/10 bg-white/5 p-7 backdrop-blur transition hover:bg-white/10">
                <span className="absolute -top-4 start-6 flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-emerald-500 text-sm font-extrabold text-white shadow-lg shadow-cyan-500/40">
                  {i + 1}
                </span>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/15 text-sky-400 ring-1 ring-sky-500/30">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 font-bold">{title.replace(/^\d+\s·\s/, "")}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery preview */}
      <section className="reveal mx-auto max-w-6xl px-4 py-24">
        <div className="flex items-end justify-between">
          <div>
            <p className="eyebrow">{d.home.portfolio}</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">{d.home.recentWork}</h2>
          </div>
          <Link href="/gallery" className="hidden items-center gap-1 text-sm font-semibold text-sky-700 hover:underline sm:flex">
            {d.home.fullGallery} <ArrowRight className="h-4 w-4 rtl:-scale-x-100" />
          </Link>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4">
          {images.slice(0, 8).map((img, i) => (
            <Link
              key={img.id}
              href="/gallery"
              className={`group overflow-hidden rounded-2xl ${i === 0 || i === 5 ? "col-span-2 row-span-2" : ""}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.imageUrl}
                alt={img.altText ?? ""}
                className={`w-full object-cover transition duration-500 group-hover:scale-110 ${i === 0 || i === 5 ? "h-full min-h-64" : "aspect-square"}`}
              />
            </Link>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="reveal mx-auto max-w-6xl px-4 pb-24">
        <h2 className="text-center text-3xl font-bold tracking-tight md:text-4xl">
          <span className="text-gradient">{d.home.kindWords}</span>
        </h2>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            [d.home.t1n, d.home.t1m, d.home.t1q],
            [d.home.t2n, d.home.t2m, d.home.t2q],
            [d.home.t3n, d.home.t3m, d.home.t3q],
          ].map(([name, meta, quote]) => (
            <figure key={name} className="card p-7">
              <Quote className="h-6 w-6 text-cyan-400 rtl:-scale-x-100" />
              <blockquote className="mt-3 text-sm leading-relaxed text-slate-600">“{quote}”</blockquote>
              <figcaption className="mt-5 flex items-center justify-between">
                <span>
                  <span className="block text-sm font-bold">{name}</span>
                  <span className="block text-xs text-slate-400">{meta}</span>
                </span>
                <span className="flex gap-0.5 text-sky-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-current" />
                  ))}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* CTA band */}
      <section className="reveal mx-auto max-w-6xl px-4 pb-24">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-950 px-8 py-16 text-center text-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/gallery/hero.jpg" alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" />
          <div className="hero-glow absolute inset-0" />
          <div className="relative">
            <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">{d.home.ctaTitle}</h2>
            <p className="mx-auto mt-3 max-w-md text-slate-300">{d.home.ctaText}</p>
            <Link href="/services" className="btn btn-amber mt-8 px-8 py-3.5 text-base">
              {d.home.ctaStart} <ArrowRight className="h-4 w-4 rtl:-scale-x-100" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
