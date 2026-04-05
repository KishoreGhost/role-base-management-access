export type Role = "viewer" | "analyst" | "operator" | "admin";

export type KPI = {
  label: string;
  value: string;
  tone: "positive" | "negative" | "neutral";
};

export type RecordItem = {
  title: string;
  type: "income" | "expense";
  category: string;
  amount: string;
  date: string;
  status: "draft" | "posted" | "archived";
};

export type UserItem = {
  name: string;
  role: Role;
  status: "active" | "inactive";
  department: string;
  lastLogin: string;
};

export type SecretInsight = {
  headline: string;
  value: string;
  rationale: string;
};

export const roleLabels: Record<Role, string> = {
  viewer: "Viewer",
  analyst: "Analyst",
  operator: "Operator",
  admin: "Admin",
};

export const navByRole: Record<Role, string[]> = {
  viewer: ["Dashboard", "Records", "Categories"],
  analyst: ["Dashboard", "Records", "Categories", "Insights"],
  operator: ["Dashboard", "Records", "Categories"],
  admin: ["Dashboard", "Records", "Categories", "Users", "Secret Sauce", "Audit Logs"],
};

export const kpis: KPI[] = [
  { label: "Income", value: "$5,000", tone: "positive" },
  { label: "Expenses", value: "$2,900", tone: "negative" },
  { label: "Net", value: "$2,100", tone: "positive" },
  { label: "Active Users", value: "4", tone: "neutral" },
];

export const revenueVsExpense = [
  { month: "Jan", income: 4200, expense: 2600 },
  { month: "Feb", income: 4700, expense: 2800 },
  { month: "Mar", income: 5200, expense: 3100 },
  { month: "Apr", income: 5000, expense: 2900 },
];

export const categoryBreakdown = [
  { name: "Sales", value: 5000, fill: "#22c55e" },
  { name: "Infrastructure", value: 700, fill: "#ef4444" },
  { name: "Payroll", value: 2200, fill: "#f97316" },
];

export const records: RecordItem[] = [
  { title: "Q2 Retainer", type: "income", category: "Sales", amount: "$5,000", date: "2026-04-01", status: "posted" },
  { title: "AWS Invoice", type: "expense", category: "Infrastructure", amount: "$700", date: "2026-04-02", status: "posted" },
  { title: "Payroll Run", type: "expense", category: "Payroll", amount: "$2,200", date: "2026-04-03", status: "draft" },
];

export const users: UserItem[] = [
  { name: "Vera View", role: "viewer", status: "active", department: "Finance", lastLogin: "Today" },
  { name: "Ari Analyst", role: "analyst", status: "active", department: "Insights", lastLogin: "Today" },
  { name: "Olive Operator", role: "operator", status: "active", department: "Operations", lastLogin: "Yesterday" },
  { name: "Ada Admin", role: "admin", status: "active", department: "Leadership", lastLogin: "Today" },
];

export const recentActivity = [
  "Posted Q2 Retainer",
  "Updated AWS Invoice",
  "Role changed for Olive Operator",
  "Secret insight refreshed",
];

export const secretInsights: SecretInsight[] = [
  {
    headline: "Fraud Risk Index",
    value: "2.1 / 10",
    rationale: "Low anomaly score across current quarter transactions.",
  },
  {
    headline: "Margin Efficiency Score",
    value: "88%",
    rationale: "Service revenue is outpacing infrastructure growth.",
  },
  {
    headline: "Top Client Concentration",
    value: "41%",
    rationale: "One client contributes a sizable share of income.",
  },
];
