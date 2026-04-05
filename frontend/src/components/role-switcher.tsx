"use client";

import { roleLabels, type Role } from "@/lib/mock-data";

export function RoleSwitcher({
  role,
  onChange,
}: {
  role: Role;
  onChange: (role: Role) => void;
}) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-100">
      <span className="text-emerald-300">Role</span>
      <select
        value={role}
        onChange={(event) => onChange(event.target.value as Role)}
        className="rounded-md border border-white/10 bg-slate-950 px-2 py-1 text-sm outline-none"
      >
        {(Object.keys(roleLabels) as Role[]).map((option) => (
          <option key={option} value={option}>
            {roleLabels[option]}
          </option>
        ))}
      </select>
    </div>
  );
}
