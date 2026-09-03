import Link from "next/link";
import { AtSign, Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { getSettings } from "@/lib/settings";
import { getLocale } from "@/lib/locale";
import { getDict } from "@/lib/i18n";
import { tc } from "@/lib/content-i18n";

export async function Footer() {
  const [s, locale] = await Promise.all([getSettings(), getLocale()]);
  const d = getDict(locale);
  return (
    <footer className="border-t border-slate-200 bg-slate-900 text-slate-300">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2 lg:col-span-1">
          <p className="text-lg font-bold text-white">{s.businessName}</p>
          <p className="mt-3 text-sm leading-relaxed text-slate-400">{tc(locale, s.description)}</p>
          <Link
            href="/booking"
            className="btn btn-amber mt-5"
          >
            {d.home.ctaStart}
          </Link>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">{d.footer.explore}</p>
          <ul className="mt-4 space-y-2.5 text-sm">
            {[
              ["/services", d.nav.services],
              ["/gallery", d.nav.gallery],
              ["/about", d.nav.about],
              ["/contact", d.nav.contact],
            ].map(([href, label]) => (
              <li key={href}>
                <Link href={href} className="text-slate-400 transition hover:text-white">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">{d.footer.contact}</p>
          <ul className="mt-4 space-y-2.5 text-sm text-slate-400">
            {s.phone && (
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 shrink-0 text-sky-500" /> {s.phone}
              </li>
            )}
            {s.email && (
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 shrink-0 text-sky-500" /> {s.email}
              </li>
            )}
            {s.whatsapp && (
              <li className="flex items-center gap-2.5">
                <MessageCircle className="h-4 w-4 shrink-0 text-sky-500" /> {s.whatsapp}
              </li>
            )}
            {s.instagram && (
              <li className="flex items-center gap-2.5">
                <AtSign className="h-4 w-4 shrink-0 text-sky-500" /> {s.instagram}
              </li>
            )}
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">{d.footer.visit}</p>
          <ul className="mt-4 space-y-2.5 text-sm text-slate-400">
            {s.location && (
              <li className="flex items-center gap-2.5">
                <MapPin className="h-4 w-4 shrink-0 text-sky-500" /> {s.location}
              </li>
            )}
            {s.businessHours && (
              <li className="flex items-center gap-2.5">
                <Clock className="h-4 w-4 shrink-0 text-sky-500" /> {s.businessHours}
              </li>
            )}
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-800 py-5 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} {s.businessName} · {d.footer.reviewed}
      </div>
    </footer>
  );
}
