"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginAction } from "@/app/login/actions";
import type { AuthActionState } from "@/lib/validations/auth";

const initialState: AuthActionState = {};

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-semibold text-zinc-700">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="h-12 w-full rounded-2xl border border-[color:var(--line)] bg-white/80 px-4 text-sm text-zinc-900 outline-none ring-0 placeholder:text-zinc-400 focus:border-[var(--brand)] focus:bg-white focus:shadow-[0_0_0_4px_rgba(15,118,110,0.10)]"
          placeholder="you@example.com"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="text-sm font-semibold text-zinc-700">
            Password
          </label>
          <span className="text-xs uppercase tracking-[0.14em] text-zinc-400">
            Secure
          </span>
        </div>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="h-12 w-full rounded-2xl border border-[color:var(--line)] bg-white/80 px-4 text-sm text-zinc-900 outline-none ring-0 placeholder:text-zinc-400 focus:border-[var(--brand)] focus:bg-white focus:shadow-[0_0_0_4px_rgba(15,118,110,0.10)]"
          placeholder="Enter your password"
        />
      </div>

      {state.error ? (
        <p className="rounded-2xl border border-red-200 bg-red-50/90 px-4 py-3 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="h-12 w-full rounded-full bg-zinc-950 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(23,32,51,0.18)] hover:-translate-y-0.5 hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
      >
        {isPending ? "Signing in..." : "Sign in to your workspace"}
      </button>

      <p className="text-center text-sm text-zinc-600">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-semibold text-[var(--brand-deep)]">
          Create one
        </Link>
      </p>
    </form>
  );
}
