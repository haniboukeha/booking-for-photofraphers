"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import type { Dict } from "@/lib/i18n";

export function SiteNav({ d }: { d: Dict }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const LINKS: [string, string][] = [
    ["/", d.nav.home],
    ["/services", d.nav.services],
    ["/gallery", d.nav.gallery],
    ["/about", d.nav.about],
    ["/contact", d.nav.contact],
  ];

  function isActive(href: string) {
    return href === "/" ? pathname === "/" : pathname.startsWith(href);
  }

  return (
    <>
      <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
        {LINKS.map(([href, label]) => (
          <Link
            key={href}
            href={href}
            onClick={() => setOpen(false)}
            className={`rounded-full px-3.5 py-2 text-sm font-medium transition ${
              isActive(href) ? "bg-slate-100 text-slate-900" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            {label}
          </Link>
        ))}
      </nav>
      <button
        onClick={() => setOpen(!open)}
        className="rounded-full p-2 text-slate-600 hover:bg-slate-100 md:hidden"
        aria-label="Toggle menu"
        aria-expanded={open}
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>
      {open && (
        <nav className="absolute inset-x-0 top-16 z-30 border-b border-slate-200 bg-white p-4 shadow-lg md:hidden" aria-label="Mobile">
          <div className="flex flex-col gap-1">
            {LINKS.map(([href, label]) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={`rounded-xl px-4 py-3 text-sm font-medium ${
                  isActive(href) ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                {label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </>
  );
}
