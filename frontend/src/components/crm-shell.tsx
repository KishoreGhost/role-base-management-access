"use client";

import { useMemo, useState } from "react";
import { Activity, BarChart3, Lock, ShieldCheck, Sparkles, Users } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Card } from "@/components/ui/card";
import {
  categoryBreakdown,
  kpis,
  navByRole,
  recentActivity,
  records,
  roleLabels,
  secretInsights,
  users,
  type Role,
  revenueVsExpense,
} from "@/lib/mock-data";
import { RoleSwitcher } from "@/components/role-switcher";

const toneClasses = {
  positive: "text-emerald-300",
  negative: "text-rose-300",
  neutral: "text-slate-200",
};

export function CrmShell() {
  const [role, setRole] = useState<Role>("admin");
  const navItems = navByRole[role];
  const canManageUsers = role === "admin";
  const canEditRecords = role === "operator" || role === "admin";
  const canSeeInsights = role === "analyst" || role === "admin";

  const heroLabel = useMemo(() => {
    if (role === "viewer") return "Read-only dashboard access";
    if (role === "analyst") return "Insights and trend access enabled";
    if (role === "operator") return "Record creation and editing enabled";
    return "Full admin control with secret metrics";
  }, [role]);

  return (
    <div className="min-h-screen bg-[#07111f] text-slate-50">
      <div className="mx-auto flex min-h-screen max-w-[1600px] gap-6 px-4 py-6 lg:px-6">
        <aside className="hidden w-72 shrink-0 rounded-3xl border border-white/10 bg-slate-950/70 p-5 lg:flex lg:flex-col">
          <div className="mb-8">
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-300">FinSight CRM</p>
            <h1 className="mt-3 text-2xl font-semibold">Finance command center</h1>
            <p className="mt-2 text-sm text-slate-400">Assessment-grade CRM portal on top of the FastAPI backend.</p>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => (
              <div
                key={item}
                className="rounded-xl border border-white/5 bg-white/5 px-4 py-3 text-sm text-slate-200"
              >
                {item}
              </div>
            ))}
          </nav>

          <Card className="mt-auto border-emerald-400/20 bg-emerald-500/10 text-sm text-emerald-50">
            <div className="flex items-center gap-2 font-medium">
              <Sparkles className="size-4" />
              Demo workflow
            </div>
            <p className="mt-3 text-emerald-100/90">
              Switch roles to verify that the same UI reveals fewer actions and less data.
            </p>
          </Card>
        </aside>

        <main className="flex-1 space-y-6">
          <header className="rounded-3xl border border-white/10 bg-slate-950/70 p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">CRM Portal</p>
                <h2 className="mt-2 text-3xl font-semibold">Fun frontend, serious backend</h2>
                <p className="mt-2 text-sm text-slate-400">{heroLabel}</p>
              </div>
              <RoleSwitcher role={role} onChange={setRole} />
            </div>
          </header>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {kpis.map((item) => (
              <Card key={item.label}>
                <p className="text-sm text-slate-400">{item.label}</p>
                <p className={`mt-3 text-3xl font-semibold ${toneClasses[item.tone]}`}>{item.value}</p>
              </Card>
            ))}
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
            <Card>
              <div className="mb-4 flex items-center gap-2">
                <BarChart3 className="size-4 text-emerald-300" />
                <h3 className="font-medium">Revenue vs expense</h3>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueVsExpense}>
                    <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />
                    <XAxis dataKey="month" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip contentStyle={{ background: "#020617", border: "1px solid rgba(255,255,255,0.1)" }} />
                    <Bar dataKey="income" fill="#22c55e" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="expense" fill="#f97316" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card>
              <div className="mb-4 flex items-center gap-2">
                <Activity className="size-4 text-cyan-300" />
                <h3 className="font-medium">Category breakdown</h3>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categoryBreakdown} dataKey="value" nameKey="name" innerRadius={65} outerRadius={95} />
                    <Tooltip contentStyle={{ background: "#020617", border: "1px solid rgba(255,255,255,0.1)" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
            <Card>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Financial records</h3>
                  <p className="text-sm text-slate-400">Role-based access to create and edit records.</p>
                </div>
                <div className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300">
                  {canEditRecords ? "Create / Edit enabled" : "Read only"}
                </div>
              </div>
              <div className="overflow-hidden rounded-2xl border border-white/10">
                <table className="min-w-full text-sm">
                  <thead className="bg-white/5 text-slate-300">
                    <tr>
                      <th className="px-4 py-3 text-left">Title</th>
                      <th className="px-4 py-3 text-left">Type</th>
                      <th className="px-4 py-3 text-left">Category</th>
                      <th className="px-4 py-3 text-left">Amount</th>
                      <th className="px-4 py-3 text-left">Date</th>
                      <th className="px-4 py-3 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((record) => (
                      <tr key={`${record.title}-${record.date}`} className="border-t border-white/10 text-slate-200">
                        <td className="px-4 py-3">{record.title}</td>
                        <td className="px-4 py-3 capitalize">{record.type}</td>
                        <td className="px-4 py-3">{record.category}</td>
                        <td className="px-4 py-3">{record.amount}</td>
                        <td className="px-4 py-3">{record.date}</td>
                        <td className="px-4 py-3 capitalize">{record.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            <Card>
              <div className="mb-4 flex items-center gap-2">
                <ShieldCheck className="size-4 text-violet-300" />
                <h3 className="font-medium">Recent activity</h3>
              </div>
              <div className="space-y-3 text-sm text-slate-300">
                {recentActivity.map((item) => (
                  <div key={item} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                    {item}
                  </div>
                ))}
              </div>
            </Card>
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <Card>
              <div className="mb-4 flex items-center gap-2">
                <Users className="size-4 text-amber-300" />
                <h3 className="font-medium">Users</h3>
              </div>
              {canManageUsers ? (
                <div className="space-y-3 text-sm">
                  {users.map((user) => (
                    <div key={user.name} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-slate-400">{roleLabels[user.role]} · {user.department}</p>
                      </div>
                      <div className="text-right text-slate-300">
                        <p className="capitalize">{user.status}</p>
                        <p className="text-xs text-slate-500">{user.lastLogin}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-full min-h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 text-center text-slate-400">
                  <Lock className="mb-3 size-6" />
                  <p>Only admins can manage users.</p>
                </div>
              )}
            </Card>

            <Card className="border-emerald-400/20 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10">
              <div className="mb-4 flex items-center gap-2">
                <Sparkles className="size-4 text-emerald-300" />
                <h3 className="font-medium">Secret Sauce</h3>
              </div>
              {role === "admin" ? (
                <div className="space-y-3">
                  {secretInsights.map((insight) => (
                    <div key={insight.headline} className="rounded-xl border border-emerald-300/20 bg-slate-950/50 px-4 py-3">
                      <div className="flex items-center justify-between gap-4">
                        <p className="font-medium">{insight.headline}</p>
                        <span className="text-emerald-300">{insight.value}</span>
                      </div>
                      <p className="mt-2 text-sm text-slate-300">{insight.rationale}</p>
                    </div>
                  ))}
                </div>
              ) : canSeeInsights ? (
                <div className="flex h-full min-h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 text-center text-slate-400">
                  <Lock className="mb-3 size-6" />
                  <p>Insights available, but secret metrics stay admin-only.</p>
                </div>
              ) : (
                <div className="flex h-full min-h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 text-center text-slate-400">
                  <Lock className="mb-3 size-6" />
                  <p>No access to advanced insights for {roleLabels[role]} role.</p>
                </div>
              )}
            </Card>
          </section>
        </main>
      </div>
    </div>
  );
}
