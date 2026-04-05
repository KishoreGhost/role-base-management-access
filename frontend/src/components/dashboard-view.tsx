"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, BarChart3, Sparkles } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Card } from "@/components/ui/card";
import { getAdminInsights, getDashboardSummary, type DashboardSummary, type SecretInsight } from "@/lib/api/dashboard";
import { useAuth } from "@/components/auth/auth-provider";

function currency(value: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(value));
}

export function DashboardView() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [insights, setInsights] = useState<SecretInsight[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      try {
        const dashboard = await getDashboardSummary();
        if (!cancelled) {
          setSummary(dashboard);
        }
        if (user?.role === "admin") {
          const secretData = await getAdminInsights();
          if (!cancelled) {
            setInsights(secretData);
          }
        } else if (!cancelled) {
          setInsights([]);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load dashboard");
        }
      }
    }

    void loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [user?.role]);

  const chartData = useMemo(
    () =>
      (summary?.monthly_trends ?? []).map((item) => ({
        month: item.month,
        income: Number(item.income),
        expense: Number(item.expense),
      })),
    [summary],
  );

  const pieData = useMemo(
    () =>
      (summary?.category_breakdown ?? []).map((item, index) => ({
        name: item.category,
        value: Number(item.total),
        fill: ["#22c55e", "#38bdf8", "#f97316", "#ef4444"][index % 4],
      })),
    [summary],
  );

  if (error) {
    return <Card className="text-rose-300">{error}</Card>;
  }

  if (!summary) {
    return <Card className="text-slate-300">Loading dashboard...</Card>;
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card><p className="text-sm text-slate-400">Income</p><p className="mt-3 text-3xl font-semibold text-emerald-300">{currency(summary.totals.total_income)}</p></Card>
        <Card><p className="text-sm text-slate-400">Expenses</p><p className="mt-3 text-3xl font-semibold text-rose-300">{currency(summary.totals.total_expenses)}</p></Card>
        <Card><p className="text-sm text-slate-400">Net</p><p className="mt-3 text-3xl font-semibold text-cyan-300">{currency(summary.totals.net_balance)}</p></Card>
        <Card><p className="text-sm text-slate-400">Recent events</p><p className="mt-3 text-3xl font-semibold text-slate-100">{summary.recent_activity.length}</p></Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
        <Card>
          <div className="mb-4 flex items-center gap-2"><BarChart3 className="size-4 text-emerald-300" /><h3 className="font-medium">Revenue vs expense</h3></div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
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
          <div className="mb-4 flex items-center gap-2"><Activity className="size-4 text-cyan-300" /><h3 className="font-medium">Category breakdown</h3></div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={65} outerRadius={95} />
                <Tooltip contentStyle={{ background: "#020617", border: "1px solid rgba(255,255,255,0.1)" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <div className="mb-4 text-sm text-slate-400">Recent activity</div>
          <div className="space-y-3">
            {summary.recent_activity.map((item) => (
              <div key={`${item.resource_type}-${item.created_at}`} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
                <div className="font-medium">{item.action} · {item.resource_type}</div>
                <div className="text-slate-400">{item.message ?? "No details"}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="border-emerald-400/20 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10">
          <div className="mb-4 flex items-center gap-2"><Sparkles className="size-4 text-emerald-300" /><h3 className="font-medium">Secret Sauce</h3></div>
          {user?.role === "admin" ? (
            <div className="space-y-3">
              {insights.map((insight) => (
                <div key={insight.headline} className="rounded-xl border border-emerald-300/20 bg-slate-950/50 px-4 py-3">
                  <div className="flex items-center justify-between gap-4"><p className="font-medium">{insight.headline}</p><span className="text-emerald-300">{insight.value}</span></div>
                  <p className="mt-2 text-sm text-slate-300">{insight.rationale}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-slate-300">Admin-only metrics are hidden for your role.</div>
          )}
        </Card>
      </section>
    </div>
  );
}
