"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useSyncExternalStore } from "react";
import { getSnapshot, subscribe } from "@/lib/cart-store";

export function CartBadge({ label }: { label: string }) {
  const items = useSyncExternalStore(subscribe, getSnapshot, () => [] as ReturnType<typeof getSnapshot>);
  return (
    <Link
      href="/booking"
      className={`relative rounded-full p-2.5 transition ${
        items.length > 0 ? "bg-gradient-to-br from-sky-500 to-cyan-500 text-white shadow-lg shadow-cyan-500/30 hover:brightness-110" : "text-slate-500 hover:bg-slate-100"
      }`}
      aria-label={`${label}, ${items.length}`}
    >
      <ShoppingBag className="h-5 w-5" />
      {items.length > 0 && (
        <span className="absolute -end-1 -top-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-slate-900 px-1 text-[10px] font-bold text-white">
          {items.length}
        </span>
      )}
    </Link>
  );
}
