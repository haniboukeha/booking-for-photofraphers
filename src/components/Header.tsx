import Link from "next/link";
import { Camera } from "lucide-react";
import { getSettings } from "@/lib/settings";
import { getLocale } from "@/lib/locale";
import { getDict } from "@/lib/i18n";
import { CartBadge } from "@/components/CartBadge";
import { SiteNav } from "@/components/SiteNav";
import { LangSwitcher } from "@/components/LangSwitcher";

export async function Header() {
  const [settings, locale] = await Promise.all([getSettings(), getLocale()]);
  const d = getDict(locale);
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur-md">
      <div className="relative mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-extrabold tracking-tight">
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 via-cyan-500 to-emerald-500 text-white shadow-lg shadow-cyan-500/30">
            <Camera className="h-4.5 w-4.5" />
          </span>
          {settings.businessName}
        </Link>
        <div className="flex items-center gap-2">
          <SiteNav d={d} />
          <LangSwitcher current={locale} />
          <CartBadge label={d.common.cart} />
          <Link href="/booking" className="btn btn-primary btn-sm hidden sm:inline-flex">
            {d.common.bookNow}
          </Link>
        </div>
      </div>
    </header>
  );
}
