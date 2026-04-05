"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Menu, ShieldCheck, X } from "lucide-react";
import { useState } from "react";

import { useAuth } from "@/components/auth/auth-provider";
import { Card } from "@/components/ui/card";
import { navItemsByRole, roleLabels } from "@/lib/auth/meta";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  if (!user) {
    return null;
  }

  const navItems = navItemsByRole[user.role];

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  return (
    <div className="min-h-screen bg-[#07111f] text-slate-50">
      <div className="mx-auto flex min-h-screen max-w-[1600px] gap-6 px-4 py-4 lg:px-6 lg:py-6">
        <aside className="hidden w-72 shrink-0 rounded-3xl border border-white/10 bg-slate-950/70 p-5 lg:flex lg:flex-col">
          <div className="mb-8">
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-300">FinSight CRM</p>
            <h1 className="mt-3 text-2xl font-semibold">Finance command center</h1>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "block rounded-xl border px-4 py-3 text-sm transition",
                  pathname === item.href
                    ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-100"
                    : "border-white/5 bg-white/5 text-slate-200 hover:bg-white/10",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <Card className="mt-6 border-cyan-400/20 bg-cyan-500/10 text-sm text-cyan-50">
            <div className="flex items-center gap-2 font-medium">
              <ShieldCheck className="size-4" />
              {roleLabels[user.role]}
            </div>
            <p className="mt-2 text-cyan-100/90">{user.full_name}</p>
            <p className="text-cyan-100/70">{user.department}</p>
          </Card>

          <button
            onClick={handleLogout}
            className="mt-auto flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200 hover:bg-white/10"
          >
            <LogOut className="size-4" />
            Logout
          </button>
        </aside>

        <main className="flex-1 space-y-4 lg:space-y-6">
          <header className="rounded-3xl border border-white/10 bg-slate-950/70 p-4 lg:p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Authenticated portal</p>
                <h2 className="mt-2 text-2xl font-semibold lg:text-3xl">Role-based finance CRM</h2>
              </div>

              <div className="flex items-center gap-2">
                <div className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-100">
                  {roleLabels[user.role]}
                </div>
                <button
                  onClick={handleLogout}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 hover:bg-white/10"
                >
                  <span className="hidden sm:inline">Logout</span>
                  <LogOut className="inline size-4 sm:ml-2" />
                </button>
                <button
                  onClick={() => setMobileNavOpen((value) => !value)}
                  className="rounded-full border border-white/10 bg-white/5 p-2 text-slate-200 hover:bg-white/10 lg:hidden"
                  aria-label="Toggle navigation"
                >
                  {mobileNavOpen ? <X className="size-4" /> : <Menu className="size-4" />}
                </button>
              </div>
            </div>

            {mobileNavOpen ? (
              <div className="mt-4 space-y-2 lg:hidden">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileNavOpen(false)}
                    className={cn(
                      "block rounded-xl border px-4 py-3 text-sm transition",
                      pathname === item.href
                        ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-100"
                        : "border-white/5 bg-white/5 text-slate-200 hover:bg-white/10",
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            ) : null}
          </header>

          {children}
        </main>
      </div>
    </div>
  );
}
