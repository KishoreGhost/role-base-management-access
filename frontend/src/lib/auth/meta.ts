import type { Role } from "@/lib/auth/types";

export const roleLabels: Record<Role, string> = {
  viewer: "Viewer",
  analyst: "Analyst",
  operator: "Operator",
  admin: "Admin",
};

export const navItemsByRole: Record<Role, Array<{ href: string; label: string }>> = {
  viewer: [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/records", label: "Records" },
    { href: "/categories", label: "Categories" },
  ],
  analyst: [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/records", label: "Records" },
    { href: "/categories", label: "Categories" },
  ],
  operator: [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/records", label: "Records" },
    { href: "/categories", label: "Categories" },
  ],
  admin: [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/records", label: "Records" },
    { href: "/categories", label: "Categories" },
    { href: "/users", label: "Users" },
    { href: "/admin/insights", label: "Secret Sauce" },
  ],
};
