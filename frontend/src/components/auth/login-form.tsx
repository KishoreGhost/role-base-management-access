"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { consumeAuthMessage, useAuth } from "@/components/auth/auth-provider";
import { ApiError } from "@/lib/api/client";

const demoAccounts = [
  "viewer@finsightcrm.com",
  "analyst@finsightcrm.com",
  "operator@finsightcrm.com",
  "admin@finsightcrm.com",
];

export function LoginForm() {
  const { login, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("admin@finsightcrm.com");
  const [password, setPassword] = useState("Password123!");
  const [error, setError] = useState<string | null>(() => consumeAuthMessage());
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      router.replace(searchParams.get("next") || "/dashboard");
    }
  }, [router, searchParams, user]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await login(email, password);
      router.replace(searchParams.get("next") || "/dashboard");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Something went wrong while signing in.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-950/80 p-6 shadow-2xl">
      <p className="text-xs uppercase tracking-[0.3em] text-emerald-300">FinSight CRM</p>
      <h1 className="mt-3 text-3xl font-semibold text-white">Sign in</h1>
      <p className="mt-2 text-sm text-slate-400">Use one of the seeded backend accounts to enter the portal.</p>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <label className="block">
          <span className="mb-2 block text-sm text-slate-300">Email</span>
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm text-slate-300">Password</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none"
          />
        </label>

        {error ? <p className="text-sm text-amber-300">{error}</p> : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-2xl bg-emerald-500 px-4 py-3 font-medium text-slate-950 transition hover:bg-emerald-400 disabled:opacity-60"
        >
          {isSubmitting ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
        <p className="font-medium text-white">Seeded accounts</p>
        <ul className="mt-2 space-y-1">
          {demoAccounts.map((account) => (
            <li key={account}>{account}</li>
          ))}
        </ul>
        <p className="mt-2 text-slate-400">Password: Password123!</p>
      </div>
    </div>
  );
}
