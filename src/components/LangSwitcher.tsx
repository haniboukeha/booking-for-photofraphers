"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Globe } from "lucide-react";
import { setLocaleAction } from "@/app/actions/locale";
import { LOCALES, type Locale } from "@/lib/i18n";

const LABELS: Record<Locale, string> = { en: "EN", fr: "FR", ar: "ع" };

export function LangSwitcher({ current }: { current: Locale }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function change(locale: Locale) {
    if (locale === current) return;
    startTransition(async () => {
      await setLocaleAction(locale);
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-0.5 rounded-full bg-slate-100 p-0.5" role="group" aria-label="Language" style={{ opacity: isPending ? 0.6 : 1 }}>
      <Globe className="ms-1.5 h-3.5 w-3.5 text-slate-400" />
      {LOCALES.map((l) => (
        <button
          key={l}
          onClick={() => change(l)}
          aria-pressed={l === current}
          className={`rounded-full px-2 py-1 text-xs font-bold transition ${
            l === current ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          {LABELS[l]}
        </button>
      ))}
    </div>
  );
}
