"use server";

import { cookies } from "next/headers";
import { parseLocale } from "@/lib/i18n";

export async function setLocaleAction(locale: string): Promise<void> {
  const validated = parseLocale(locale);
  const store = await cookies();
  store.set("locale", validated, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}
