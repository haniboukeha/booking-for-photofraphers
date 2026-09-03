"use client";

import { useActionState } from "react";
import { Camera, Lock } from "lucide-react";
import { login, type AuthState } from "@/app/actions/auth";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(login, {});
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4">
      <div
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{ background: "radial-gradient(50% 60% at 50% 0%, rgb(245 158 11 / 0.18), transparent 70%)" }}
      />
      <form action={formAction} className="relative w-full max-w-sm rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl backdrop-blur">
        <div className="flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-500 text-slate-900">
            <Camera className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-lg font-bold text-white">Admin sign in</h1>
            <p className="text-xs text-slate-400">Protected area — staff only.</p>
          </div>
        </div>

        <label className="mt-8 block text-sm font-medium text-slate-300">
          Email
          <input
            name="email"
            type="email"
            required
            autoComplete="username"
            autoFocus
            className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
          />
        </label>
        <label className="mt-4 block text-sm font-medium text-slate-300">
          Password
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-sm text-white focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
          />
        </label>

        {state.error && (
          <p className="mt-4 rounded-xl bg-red-500/10 px-3 py-2 text-sm font-medium text-red-400 ring-1 ring-red-500/30" role="alert">
            {state.error}
          </p>
        )}

        <button
          disabled={pending}
          className="btn btn-amber mt-6 w-full"
        >
          <Lock className="h-4 w-4" />
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
