"use client";

import { useEffect, useMemo, useState } from "react";

import { Card } from "@/components/ui/card";
import { useAuth } from "@/components/auth/auth-provider";
import { createRecord, deleteRecord, getRecords, updateRecord, type RecordItem } from "@/lib/api/records";
import { getCategories, type CategoryItem } from "@/lib/api/categories";

const initialForm = {
  title: "",
  amount: "",
  currency: "USD",
  entry_type: "expense",
  category_id: "",
  occurred_on: "2026-04-03",
  status: "draft",
};

const initialFilters = {
  search: "",
  type: "",
  status: "",
  category: "",
  startDate: "",
  endDate: "",
};

function matchesText(value: string | null | undefined, search: string) {
  return (value ?? "").toLowerCase().includes(search.toLowerCase());
}

export function RecordsView() {
  const { user } = useAuth();
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState(initialFilters);

  const canWrite = user?.role === "operator" || user?.role === "admin";
  const canDelete = user?.role === "admin";

  async function load() {
    try {
      const [recordsData, categoriesData] = await Promise.all([getRecords(), getCategories()]);
      setRecords(recordsData);
      setCategories(categoriesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load records");
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function loadRecords() {
      try {
        const [recordsData, categoriesData] = await Promise.all([getRecords(), getCategories()]);
        if (!cancelled) {
          setRecords(recordsData);
          setCategories(categoriesData);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load records");
        }
      }
    }

    void loadRecords();

    return () => {
      cancelled = true;
    };
  }, []);

  const expenseCategories = useMemo(
    () => categories.filter((category) => category.kind === form.entry_type),
    [categories, form.entry_type],
  );

  const visibleRecords = useMemo(() => {
    return records.filter((record) => {
      const search = filters.search.trim().toLowerCase();
      const matchesSearch =
        !search ||
        matchesText(record.title, search) ||
        matchesText(record.category.name, search) ||
        matchesText(record.reference_code, search);

      const matchesType = !filters.type || record.entry_type === filters.type;
      const matchesStatus = !filters.status || record.status === filters.status;
      const matchesCategory = !filters.category || String(record.category_id) === filters.category;
      const matchesStartDate = !filters.startDate || record.occurred_on >= filters.startDate;
      const matchesEndDate = !filters.endDate || record.occurred_on <= filters.endDate;

      return (
        matchesSearch &&
        matchesType &&
        matchesStatus &&
        matchesCategory &&
        matchesStartDate &&
        matchesEndDate
      );
    });
  }, [records, filters]);

  const hasActiveFilters = useMemo(() => Object.values(filters).some(Boolean), [filters]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    try {
      const payload = {
        title: form.title,
        amount: form.amount,
        currency: form.currency,
        entry_type: form.entry_type as "income" | "expense",
        category_id: Number(form.category_id),
        occurred_on: form.occurred_on,
        status: form.status as "draft" | "posted" | "archived",
      };

      if (editingId) {
        await updateRecord(editingId, payload);
      } else {
        await createRecord(payload);
      }
      setForm(initialForm);
      setEditingId(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save record");
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-medium">Financial records</h3>
            <p className="text-sm text-slate-400">Live backend records with create/update/delete based on role.</p>
          </div>
          <div className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300">
            {canWrite ? "Writes enabled" : "Read only"}
          </div>
        </div>

        {canWrite ? (
          <form className="mb-6 grid gap-3 md:grid-cols-3" onSubmit={handleSubmit}>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Title" className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3" />
            <input value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="Amount" className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3" />
            <select value={form.entry_type} onChange={(e) => setForm({ ...form, entry_type: e.target.value, category_id: "" })} className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3">
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
            <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3">
              <option value="">Select category</option>
              {expenseCategories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
            <input type="date" value={form.occurred_on} onChange={(e) => setForm({ ...form, occurred_on: e.target.value })} className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3" />
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3">
              <option value="draft">Draft</option>
              <option value="posted">Posted</option>
              <option value="archived">Archived</option>
            </select>
            <div className="flex gap-3">
              <button type="submit" className="rounded-2xl bg-emerald-500 px-4 py-3 font-medium text-slate-950">{editingId ? "Update" : "Create"} record</button>
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
        ) : null}

        {!canWrite ? (
          <p className="mb-4 text-sm text-slate-400">Your role can view records but cannot create, edit, or delete them.</p>
        ) : null}

        <div className="mb-4 rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h4 className="text-sm font-medium text-slate-200">Filter records</h4>
            <div className="text-sm text-slate-400">{visibleRecords.length} / {records.length} visible</div>
          </div>
          <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
            <input
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              placeholder="Search title, category, or reference"
              className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3"
            />
            <select value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })} className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3">
              <option value="">All types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
            <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3">
              <option value="">All statuses</option>
              <option value="draft">Draft</option>
              <option value="posted">Posted</option>
              <option value="archived">Archived</option>
            </select>
            <select value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })} className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3">
              <option value="">All categories</option>
              {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
            <input type="date" value={filters.startDate} onChange={(e) => setFilters({ ...filters, startDate: e.target.value })} className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3" />
            <input type="date" value={filters.endDate} onChange={(e) => setFilters({ ...filters, endDate: e.target.value })} className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3" />
          </div>
          {hasActiveFilters ? (
            <button type="button" onClick={() => setFilters(initialFilters)} className="mt-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200">
              Clear filters
            </button>
          ) : null}
        </div>

        <p className="mb-4 text-sm text-slate-400">Select a row action to edit it. Delete is admin-only.</p>

        {error ? <p className="mb-4 text-sm text-rose-300">{error}</p> : null}
        {visibleRecords.length === 0 ? <p className="mb-4 text-sm text-slate-400">No records match the current filters.</p> : null}

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
                {canWrite ? <th className="px-4 py-3 text-left">Actions</th> : null}
              </tr>
            </thead>
            <tbody>
              {visibleRecords.map((record) => (
                <tr key={record.id} className="border-t border-white/10 text-slate-200">
                  <td className="px-4 py-3">{record.title}</td>
                  <td className="px-4 py-3 capitalize">{record.entry_type}</td>
                  <td className="px-4 py-3">{record.category.name}</td>
                  <td className="px-4 py-3">{record.currency} {record.amount}</td>
                  <td className="px-4 py-3">{record.occurred_on}</td>
                  <td className="px-4 py-3 capitalize">{record.status}</td>
                  {canWrite ? (
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          className="rounded-lg border border-white/10 px-3 py-1"
                          onClick={() => {
                            setEditingId(record.id);
                            setForm({
                              title: record.title,
                              amount: record.amount,
                              currency: record.currency,
                              entry_type: record.entry_type,
                              category_id: String(record.category_id),
                              occurred_on: record.occurred_on,
                              status: record.status,
                            });
                          }}
                        >
                          Edit
                        </button>
                        {canDelete ? (
                          <button
                            className="rounded-lg border border-rose-400/30 px-3 py-1 text-rose-300"
                            onClick={async () => {
                              await deleteRecord(record.id);
                              await load();
                            }}
                          >
                            Delete
                          </button>
                        ) : null}
                      </div>
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
