import { render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";

import { DashboardView } from "@/components/dashboard-view";

vi.mock("@/components/auth/auth-provider", () => ({
  useAuth: () => ({ user: { role: "admin" } }),
}));

vi.mock("@/lib/api/dashboard", () => ({
  getDashboardSummary: () => Promise.resolve({
    totals: { total_income: "5000", total_expenses: "2900", net_balance: "2100" },
    category_breakdown: [{ category: "Sales", entry_type: "income", total: "5000" }],
    monthly_trends: [{ month: "2026-04", income: "5000", expense: "2900" }],
    recent_activity: [{ action: "login", resource_type: "auth", message: "ok", created_at: "2026-04-04T00:00:00Z" }],
  }),
  getAdminInsights: () => Promise.resolve([
    { headline: "Fraud Risk Index", value: "2.1 / 10", rationale: "Low anomaly score." },
  ]),
}));

describe("DashboardView", () => {
  it("renders dashboard totals and insights", async () => {
    render(<DashboardView />);
    await waitFor(() => expect(screen.getByText(/fraud risk index/i)).toBeInTheDocument());
    expect(screen.getByText(/income/i)).toBeInTheDocument();
  });
});
