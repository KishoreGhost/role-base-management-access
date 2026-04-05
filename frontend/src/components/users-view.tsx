"use client";

import { useEffect, useMemo, useState } from "react";

import { Card } from "@/components/ui/card";
import { RoleGate } from "@/components/role-gate";
import { createUser, getUsers, updateUser, type UserItem } from "@/lib/api/users";
import type { Role, UserStatus } from "@/lib/auth/types";

const initialForm = {
  full_name: "",
  email: "",
  role: "viewer" as Role,
  status: "active" as UserStatus,
  department: "Finance",
  password: "Password123!",
};

const initialFilters = {
  search: "",
  role: "",
  status: "",
};

function matchesText(value: string, search: string) {
  return value.toLowerCase().includes(search.toLowerCase());
}

export function UsersView() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState(initialFilters);

  const visibleUsers = useMemo(() => {
    return users.filter((user) => {
      const search = filters.search.trim().toLowerCase();
      const matchesSearch =
        !search ||
        matchesText(user.full_name, search) ||
        matchesText(user.email, search) ||
        matchesText(user.department, search);
      const matchesRole = !filters.role || user.role === filters.role;
      const matchesStatus = !filters.status || user.status === filters.status;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, filters]);

  const hasActiveFilters = useMemo(() => Object.values(filters).some(Boolean), [filters]);

  async function load() {
    try {
      setUsers(await getUsers());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users");
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function loadUsers() {
      try {
        const data = await getUsers();
        if (!cancelled) {
          setUsers(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load users");
        }
      }
    }

    void loadUsers();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      if (editingId) {
        await updateUser(editingId, form);
      } else {
        await createUser(form);
      }
      setForm(initialForm);
      setEditingId(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save user");
    }
  }

  return (
    <RoleGate allowed={["admin"]}>
      <Card>
        <h3 className="font-medium">Users</h3>
        <p className="mt-1 text-sm text-slate-400">Admin-only user management backed by live API calls.</p>
        <form className="mt-4 grid gap-3 md:grid-cols-3" onSubmit={handleSubmit}>
          <input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} placeholder="Full name" className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3" />
          <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3" />
          <input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} placeholder="Department" className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3" />
          <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as Role })} className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3"><option value="viewer">Viewer</option><option value="analyst">Analyst</option><option value="operator">Operator</option><option value="admin">Admin</option></select>
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as UserStatus })} className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3"><option value="active">Active</option><option value="inactive">Inactive</option></select>
          <input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Password" className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3" />
          <div className="flex gap-3">
            <button type="submit" className="rounded-2xl bg-emerald-500 px-4 py-3 font-medium text-slate-950">{editingId ? "Update" : "Create"} user</button>
            {editingId ? (
              <button
                type="button"
                onClick={() => { setEditingId(null); setForm(initialForm); }}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-slate-200"
              >
                Cancel
              </button>
            ) : null}
          </div>
        </form>

        <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h4 className="text-sm font-medium text-slate-200">Filter users</h4>
            <div className="text-sm text-slate-400">{visibleUsers.length} / {users.length} visible</div>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <input
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              placeholder="Search name, email, or department"
              className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3"
            />
            <select value={filters.role} onChange={(e) => setFilters({ ...filters, role: e.target.value })} className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3">
              <option value="">All roles</option>
              <option value="viewer">Viewer</option>
              <option value="analyst">Analyst</option>
              <option value="operator">Operator</option>
              <option value="admin">Admin</option>
            </select>
            <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3">
              <option value="">All statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          {hasActiveFilters ? (
            <button type="button" onClick={() => setFilters(initialFilters)} className="mt-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200">
              Clear filters
            </button>
          ) : null}
        </div>

        <p className="mt-4 text-sm text-slate-400">Use Edit to load a user into the form.</p>
        {error ? <p className="mt-4 text-sm text-rose-300">{error}</p> : null}
        {visibleUsers.length === 0 ? <p className="mt-4 text-sm text-slate-400">No users match the current filters.</p> : null}
        <div className="mt-4 space-y-3">
          {visibleUsers.map((user) => (
            <div key={user.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
              <div>
                <p className="font-medium">{user.full_name}</p>
                <p className="text-slate-400">{user.email} · {user.role} · {user.department}</p>
              </div>
              <button className="rounded-lg border border-white/10 px-3 py-1" onClick={() => { setEditingId(user.id); setForm({ full_name: user.full_name, email: user.email, role: user.role, status: user.status, department: user.department, password: "Password123!" }); }}>
                Edit
              </button>
            </div>
          ))}
        </div>
      </Card>
    </RoleGate>
  );
}
