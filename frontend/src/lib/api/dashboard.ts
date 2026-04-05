export type DashboardSummary = {
  totals: {
    total_income: string;
    total_expenses: string;
    net_balance: string;
  };
  category_breakdown: Array<{
    category: string;
    entry_type: string;
    total: string;
  }>;
  monthly_trends: Array<{
    month: string;
    income: string;
    expense: string;
  }>;
  recent_activity: Array<{
    action: string;
    resource_type: string;
    message: string | null;
    created_at: string;
  }>;
};

export type SecretInsight = {
  headline: string;
  value: string;
  rationale: string;
};

import { apiRequest } from "@/lib/api/client";

export function getDashboardSummary() {
  return apiRequest<DashboardSummary>("/dashboard/summary");
}

export function getAdminInsights() {
  return apiRequest<SecretInsight[]>("/admin/insights");
}
