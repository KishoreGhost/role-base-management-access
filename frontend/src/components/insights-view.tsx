"use client";

import { useEffect, useState } from "react";

import { RoleGate } from "@/components/role-gate";
import { Card } from "@/components/ui/card";
import { getAdminInsights, type SecretInsight } from "@/lib/api/dashboard";

export function InsightsView() {
  const [insights, setInsights] = useState<SecretInsight[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadInsights() {
      try {
        const data = await getAdminInsights();
        if (!cancelled) {
          setInsights(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load insights");
        }
      }
    }

    void loadInsights();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <RoleGate allowed={["admin"]}>
      <div className="space-y-4">
        {error ? <Card className="text-rose-300">{error}</Card> : null}
        {insights.map((insight) => (
          <Card key={insight.headline} className="border-emerald-400/20 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10">
            <div className="flex items-center justify-between gap-4"><h3 className="font-medium">{insight.headline}</h3><span className="text-emerald-300">{insight.value}</span></div>
            <p className="mt-2 text-sm text-slate-300">{insight.rationale}</p>
          </Card>
        ))}
      </div>
    </RoleGate>
  );
}
