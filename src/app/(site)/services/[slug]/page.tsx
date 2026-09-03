import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock } from "lucide-react";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { getLocale } from "@/lib/locale";
import { getDict } from "@/lib/i18n";
import { PackagePicker } from "@/components/PackagePicker";

export default async function ServicePage({ params }: PageProps<"/services/[slug]">) {
  const { slug } = await params;
  const [settings, locale, service] = await Promise.all([
    getSettings(),
    getLocale(),
    prisma.service.findFirst({
      where: { slug, active: true, archivedAt: null },
      include: {
        packages: {
          where: { active: true, archivedAt: null },
          orderBy: { sortOrder: "asc" },
          include: { addons: { include: { addon: true } } },
        },
      },
    }),
  ]);
  const d = getDict(locale);

  if (!service) notFound();

  const pickerData = service.packages.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    image: p.imageUrl,
    price: p.price,
    features: p.features,
    addons: p.addons
      .filter((l) => l.addon.active && !l.addon.archivedAt)
      .map((l) => ({
        id: l.addon.id,
        name: l.addon.name,
        image: l.addon.imageUrl,
        price: l.addon.price,
        allowQuantity: l.addon.allowQuantity,
        minQuantity: l.addon.minQuantity,
        maxQuantity: l.addon.maxQuantity,
      })),
  }));

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <Link href="/services" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-slate-900">
        <ArrowLeft className="h-4 w-4 rtl:-scale-x-100" /> {d.serviceDetail.back}
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-5 lg:items-start">
        <div className="lg:col-span-2">
          <div className="relative overflow-hidden rounded-3xl shadow-xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={service.coverImageUrl ?? "/gallery/g1.jpg"} alt={service.name} className="w-full object-cover" />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/90 to-transparent p-6 text-white">
              <h1 className="text-2xl font-extrabold tracking-tight">{service.name}</h1>
              <p className="mt-1 flex items-center gap-2 text-sm text-slate-300">
                <Clock className="h-4 w-4 text-sky-400" /> {d.serviceDetail.duration}: {Math.round(service.durationMinutes / 60)}h
              </p>
            </div>
          </div>
          <p className="card mt-5 p-5 text-sm leading-relaxed text-slate-600">{service.description}</p>
        </div>

        <div className="lg:col-span-3">
          <PackagePicker
            locale={locale}
            serviceId={service.id}
            serviceName={service.name}
            durationMinutes={service.durationMinutes}
            currency={settings.currency}
            packages={pickerData}
          />
        </div>
      </div>
    </div>
  );
}
