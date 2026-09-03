"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { verifyPassword } from "@/lib/auth/password";
import { createSessionCookie, destroySessionCookie } from "@/lib/auth/session";
import { loginSchema } from "@/lib/validation";

export interface AuthState {
  error?: string;
}

export async function login(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: "Enter a valid email and password (min 8 characters)." };

  const admin = await prisma.adminUser.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
  if (!admin || !(await verifyPassword(parsed.data.password, admin.passwordHash))) {
    return { error: "Invalid credentials." };
  }

  await createSessionCookie(admin.id, admin.email);
  redirect("/admin");
}

export async function logout(): Promise<void> {
  await destroySessionCookie();
  redirect("/admin/login");
}
