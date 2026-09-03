import { getSettings } from "@/lib/settings";
import { getLocale } from "@/lib/locale";
import { getDict } from "@/lib/i18n";
import { todayInZone } from "@/lib/timezone";
import { BookingFlow } from "@/components/BookingFlow";

export default async function BookingPage() {
  const [settings, locale] = await Promise.all([getSettings(), getLocale()]);
  const d = getDict(locale);
  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <p className="eyebrow">{d.booking.eyebrow}</p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-5xl">{d.booking.title}</h1>
      <p className="mt-2 max-w-xl text-slate-500">{d.booking.sub}</p>
      <div className="mt-10">
        <BookingFlow
          locale={locale}
          currency={settings.currency}
          today={todayInZone(settings.timezone)}
          openTime={settings.openTime}
          closeTime={settings.closeTime}
        />
      </div>
    </div>
  );
}
