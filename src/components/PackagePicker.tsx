"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Check, Minus, Plus, ShoppingBag, Sparkles } from "lucide-react";
import { addToCart, type CartAddon, type CartItem } from "@/lib/cart-store";
import { computeTotal } from "@/lib/pricing";
import { formatMoney } from "@/lib/money";
import { getDict, fmt, type Locale } from "@/lib/i18n";

interface AddonData {
  id: string;
  name: string;
  image?: string | null;
  price: number;
  allowQuantity: boolean;
  minQuantity: number;
  maxQuantity: number;
}

interface PackageData {
  id: string;
  name: string;
  description: string | null;
  image?: string | null;
  price: number;
  features: string[];
  addons: AddonData[];
}

export function PackagePicker({
  locale,
  serviceId,
  serviceName,
  durationMinutes,
  currency,
  packages,
}: {
  locale: Locale;
  serviceId: string;
  serviceName: string;
  durationMinutes: number;
  currency: string;
  packages: PackageData[];
}) {
  const d = getDict(locale);
  const [selectedId, setSelectedId] = useState(packages[0]?.id ?? "");
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [added, setAdded] = useState(false);

  const pkg = packages.find((p) => p.id === selectedId) ?? packages[0];

  const selectedAddons: CartAddon[] = useMemo(() => {
    if (!pkg) return [];
    return pkg.addons
      .filter((a) => (quantities[a.id] ?? 0) > 0)
      .map((a) => ({
        addonId: a.id,
        name: a.name,
        price: a.price,
        quantity: quantities[a.id],
        minQuantity: a.minQuantity,
        maxQuantity: a.maxQuantity,
        allowQuantity: a.allowQuantity,
      }));
  }, [pkg, quantities]);

  const total = pkg ? computeTotal(pkg.price, selectedAddons) : 0;

  function toggleAddon(addon: AddonData) {
    setAdded(false);
    setQuantities((q) => {
      const next = { ...q };
      if ((next[addon.id] ?? 0) > 0) delete next[addon.id];
      else next[addon.id] = addon.allowQuantity ? Math.max(addon.minQuantity, 1) : 1;
      return next;
    });
  }

  function changeQty(addon: AddonData, delta: number) {
    setQuantities((q) => {
      const current = q[addon.id] ?? addon.minQuantity;
      const next = Math.min(addon.maxQuantity, Math.max(addon.minQuantity, current + delta));
      return { ...q, [addon.id]: next };
    });
  }

  function handleAdd() {
    if (!pkg) return;
    const item: CartItem = {
      id: crypto.randomUUID(),
      serviceId,
      serviceName,
      packageId: pkg.id,
      packageName: pkg.name,
      packagePrice: pkg.price,
      durationMinutes,
      addons: selectedAddons,
    };
    addToCart(item);
    setAdded(true);
  }

  if (!pkg) return <p className="mt-4 text-slate-500">{d.serviceDetail.noPackages}</p>;

  return (
    <div>
      <h2 className="text-xl font-bold tracking-tight">{d.serviceDetail.choose}</h2>
      <p className="mt-1 text-sm text-slate-500">{d.serviceDetail.chooseSub}</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {packages.map((p) => {
          const active = p.id === selectedId;
          return (
            <button
              key={p.id}
              onClick={() => {
                setSelectedId(p.id);
                setQuantities({});
                setAdded(false);
              }}
              aria-pressed={active}
              className={`relative rounded-2xl border p-5 text-left transition ${
                active
                  ? "border-cyan-500 bg-gradient-to-br from-sky-50 to-cyan-50 shadow-lg shadow-cyan-500/10 ring-2 ring-cyan-500"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-md"
              }`}
            >
              {active && (
                <span className="absolute end-3 top-3 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-emerald-500 text-white">
                  <Check className="h-3 w-3" strokeWidth={3} />
                </span>
              )}
              {p.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.image} alt="" className="-mx-5 -mt-5 mb-4 h-28 w-full rounded-t-2xl object-cover" />
              )}
              <p className="font-semibold">{p.name}</p>
              {p.description && <p className="mt-0.5 text-xs text-slate-500">{p.description}</p>}
              <p className="mt-3 text-xl font-bold tracking-tight">{formatMoney(p.price, currency)}</p>
              <ul className="mt-3 space-y-1.5 text-sm text-slate-600">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-1.5">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" /> {f}
                  </li>
                ))}
              </ul>
            </button>
          );
        })}
      </div>

      {pkg.addons.length > 0 && (
        <div className="mt-8">
          <h3 className="flex items-center gap-2 text-lg font-semibold">
            <Sparkles className="h-4 w-4 text-cyan-500" /> {d.serviceDetail.extras}
          </h3>
          <div className="mt-4 space-y-2.5">
            {pkg.addons.map((a) => {
              const selected = (quantities[a.id] ?? 0) > 0;
              return (
                <div
                  key={a.id}
                  className={`flex items-center justify-between rounded-2xl border px-5 py-4 transition ${
                    selected ? "border-cyan-500 bg-gradient-to-r from-sky-50 to-cyan-50" : "border-slate-200 bg-white"
                  }`}
                >
                  <label className="flex cursor-pointer items-center gap-3">
                    <input type="checkbox" checked={selected} onChange={() => toggleAddon(a)} className="h-4.5 w-4.5 accent-sky-600" />
                    {a.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={a.image} alt="" className="h-10 w-10 shrink-0 rounded-lg object-cover" />
                    )}
                    <span>
                      <span className="block text-sm font-semibold">{a.name}</span>
                      <span className="block text-sm text-slate-500">
                        {formatMoney(a.price, currency)}
                        {a.allowQuantity && a.maxQuantity > 1 ? ` · ${fmt(d.serviceDetail.upTo, { n: a.maxQuantity })}` : ""}
                      </span>
                    </span>
                  </label>
                  {selected && a.allowQuantity && (
                    <div className="flex items-center gap-1 rounded-full border border-slate-300 bg-white p-1">
                      <button
                        onClick={() => changeQty(a, -1)}
                        className="flex h-7 w-7 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100 disabled:opacity-40"
                        disabled={(quantities[a.id] ?? 0) <= a.minQuantity}
                        aria-label={`Decrease ${a.name}`}
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-7 text-center text-sm font-bold">{quantities[a.id]}</span>
                      <button
                        onClick={() => changeQty(a, 1)}
                        className="flex h-7 w-7 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100 disabled:opacity-40"
                        disabled={(quantities[a.id] ?? 0) >= a.maxQuantity}
                        aria-label={`Increase ${a.name}`}
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="card mt-8 flex flex-wrap items-center justify-between gap-4 p-5">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">{d.serviceDetail.estimatedTotal}</p>
          <p className="text-2xl font-bold tracking-tight">{formatMoney(total, currency)}</p>
        </div>
        <div className="flex items-center gap-3">
          {added && (
            <span className="text-sm font-medium text-emerald-600">
              {d.serviceDetail.added} <Link href="/booking" className="underline">{d.serviceDetail.goToBooking}</Link>
            </span>
          )}
          <button onClick={handleAdd} className="btn btn-amber">
            <ShoppingBag className="h-4 w-4" /> {d.serviceDetail.add}
          </button>
        </div>
      </div>
    </div>
  );
}
