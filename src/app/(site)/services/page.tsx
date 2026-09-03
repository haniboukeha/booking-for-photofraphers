import Link from "next/link";
import { ArrowRight, Clock, Layers } from "lucide-react";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { getLocale } from "@/lib/locale";
import { getDict } from "@/lib/i18n";
import { formatMoney } from "@/lib/money";

export default async function ServicesPage() {
  const [settings, locale, services] = await Promise.all([
    getSettings(),
    getLocale(),
    prisma.service.findMany({
      where: { active: true, archivedAt: null },
      orderBy: { createdAt: "asc" },
      include: { _count: { select: { packages: true } } },
    }),
  ]);
  const d = getDict(locale);

  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <p className="eyebrow">{d.services.eyebrow}</p>
      <h1 className="mt-2 text-4xl font-extrabold tracking-tight md:text-5xl">{d.services.title}</h1>
      <p className="mt-3 max-w-xl text-slate-500">{d.services.sub}</p>

      <div className="reveal mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
              className="h-80 w-full object-cover transition duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/30 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 text-white">
              <div className="flex items-center gap-3 text-xs text-slate-300">
                <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {Math.round(s.durationMinutes / 60)}h</span>
                <span className="flex items-center gap-1"><Layers className="h-3.5 w-3.5" /> {s._count.packages} {d.common.packages}</span>
              </div>
              <h2 className="mt-1.5 text-xl font-bold">{s.name}</h2>
              <p className="mt-1 line-clamp-2 text-sm text-slate-300">{s.description}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="chip bg-white/10 text-sky-300 ring-1 ring-white/25 backdrop-blur">
                  {d.common.from} {formatMoney(s.basePrice, settings.currency)}
                </span>
                <span className="flex items-center gap-1 text-sm font-semibold text-white opacity-0 transition group-hover:opacity-100">
                  {d.services.explore} <ArrowRight className="h-4 w-4 rtl:-scale-x-100" />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
