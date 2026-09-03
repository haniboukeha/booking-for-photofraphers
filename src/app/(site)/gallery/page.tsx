import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { prisma } from "@/lib/db";
import { getLocale } from "@/lib/locale";
import { getDict } from "@/lib/i18n";
import { tc } from "@/lib/content-i18n";

export default async function GalleryPage() {
  const [locale, images] = await Promise.all([
    getLocale(),
    prisma.galleryImage.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
      include: { service: { select: { name: true, slug: true } } },
    }),
  ]);
  const d = getDict(locale);

  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <p className="eyebrow">{d.gallery.eyebrow}</p>
      <h1 className="mt-2 text-4xl font-extrabold tracking-tight md:text-5xl">{d.gallery.title}</h1>
      <p className="mt-3 max-w-xl text-slate-500">{d.gallery.sub}</p>

      <div className="mt-12 columns-1 gap-4 sm:columns-2 lg:columns-3 [&>figure]:mb-4 [&>figure]:break-inside-avoid">
        {images.map((img) => (
          <figure key={img.id} className="group relative overflow-hidden rounded-3xl shadow-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img.imageUrl}
              alt={img.altText ?? ""}
              className="w-full object-cover transition duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />
            <figcaption className="absolute inset-x-0 bottom-0 translate-y-4 p-5 text-sm font-semibold text-white opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
              {img.service ? (
                <Link href={`/services/${img.service.slug}`} className="hover:underline">
                  {tc(locale, img.service.name)} →
                </Link>
              ) : (
                tc(locale, img.altText)
              )}
            </figcaption>
          </figure>
        ))}
      </div>

      <div className="relative mt-14 overflow-hidden rounded-[2.5rem] bg-slate-950 px-8 py-14 text-center text-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/gallery/g3.jpg" alt="" className="absolute inset-0 h-full w-full object-cover opacity-20" />
        <div className="hero-glow absolute inset-0" />
        <div className="relative">
          <h2 className="text-2xl font-extrabold md:text-3xl">{d.gallery.likeTitle}</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-slate-300">{d.gallery.likeText}</p>
          <Link href="/services" className="btn btn-amber mt-6">
            {d.gallery.start} <ArrowRight className="h-4 w-4 rtl:-scale-x-100" />
          </Link>
        </div>
      </div>
    </div>
  );
}
