"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  CalendarDays,
  Images,
  LayoutDashboard,
  LogOut,
  Package,
  PlusCircle,
  Settings,
  ShoppingBag,
  Users,
} from "lucide-react";
import { logout } from "@/app/actions/auth";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/bookings", label: "Bookings", icon: CalendarDays },
  { href: "/admin/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/services", label: "Services", icon: PlusCircle },
  { href: "/admin/packages", label: "Packages", icon: Package },
  { href: "/admin/addons", label: "Add-ons", icon: ShoppingBag },
  { href: "/admin/gallery", label: "Gallery", icon: Images },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

function linkClass(pathname: string, item: (typeof NAV)[number]) {
  const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
  return `flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${
    active ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
  }`;
}

export function AdminNav() {
  const pathname = usePathname();
  return (
    <>
      <nav className="hidden flex-1 space-y-0.5 px-3 md:block" aria-label="Admin">
        {NAV.map((item) => (
          <Link key={item.href} href={item.href} className={linkClass(pathname, item)}>
            <item.icon className="h-4 w-4 shrink-0" />
            {item.label}
          </Link>
        ))}
      </nav>
      <nav className="flex gap-1 overflow-x-auto border-b border-slate-200 bg-white px-3 py-2 md:hidden" aria-label="Admin mobile">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold ${
              item.exact ? pathname === item.href : pathname.startsWith(item.href)
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </>
  );
}

export function AdminLogout() {
  return (
    <form action={logout}>
      <button className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-red-50 hover:text-red-600">
        <LogOut className="h-4 w-4" />
        Sign out
      </button>
    </form>
  );
}
