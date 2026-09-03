import Link from "next/link";
import { Camera } from "lucide-react";
import { getLocale } from "@/lib/locale";
import { getDict } from "@/lib/i18n";

export default async function NotFound() {
  const locale = await getLocale();
  const d = getDict(locale);
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 text-sky-400">
        <Camera className="h-7 w-7" />
      </div>
      <p className="mt-6 text-sm font-semibold uppercase tracking-widest text-sky-600">404</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight">{d.notFound.title}</h1>
      <p className="mt-3 max-w-sm text-slate-500">{d.notFound.text}</p>
      <Link href="/" className="btn btn-primary mt-8">
        {d.notFound.back}
      </Link>
    </div>
  );
}
