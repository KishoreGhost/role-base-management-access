"use client";

import { useEffect, useState } from "react";

import { Card } from "@/components/ui/card";
import { useAuth } from "@/components/auth/auth-provider";
import { createCategory, getCategories, updateCategory, type CategoryItem, type CategoryPayload } from "@/lib/api/categories";

const initialForm: CategoryPayload = { name: "", kind: "expense", color: "#2563eb", is_active: true };

type CategoryFormState = CategoryPayload;

export function CategoriesView() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [form, setForm] = useState<CategoryFormState>(initialForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canWrite = user?.role === "admin";

  async function load() {
    try {
      setCategories(await getCategories());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load categories");
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function loadCategories() {
      try {
        const data = await getCategories();
        if (!cancelled) {
          setCategories(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load categories");
        }
      }
    }

    void loadCategories();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      if (editingId) {
        await updateCategory(editingId, form);
      } else {
        await createCategory(form);
      }
      setForm(initialForm);
      setEditingId(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save category");
    }
  }

  return (
    <Card>
      <h3 className="font-medium">Categories</h3>
      <p className="mt-1 text-sm text-slate-400">Live category list from the backend.</p>
      {canWrite ? (
        <form className="mt-4 grid gap-3 md:grid-cols-4" onSubmit={handleSubmit}>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name" className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3" />
          <select value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value as "income" | "expense" })} className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3"><option value="income">Income</option><option value="expense">Expense</option></select>
          <input value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} placeholder="#2563eb" className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3" />
          <div className="flex gap-3">
            <button type="submit" className="rounded-2xl bg-emerald-500 px-4 py-3 font-medium text-slate-950">{editingId ? "Update" : "Create"} category</button>
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

      {!canWrite ? <p className="mt-4 text-sm text-slate-400">Only admins can create or edit categories.</p> : null}

      <p className="mt-4 text-sm text-slate-400">Use Edit to load a category into the form.</p>
      {error ? <p className="mt-4 text-sm text-rose-300">{error}</p> : null}
      <div className="mt-4 space-y-3">
        {categories.map((category) => (
          <div key={category.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
            <div><span className="font-medium">{category.name}</span><span className="ml-2 text-slate-400 capitalize">{category.kind}</span></div>
            {canWrite ? <button className="rounded-lg border border-white/10 px-3 py-1" onClick={() => { setEditingId(category.id); setForm({ name: category.name, kind: category.kind, color: category.color, is_active: category.is_active }); }}>Edit</button> : null}
          </div>
        ))}
      </div>
    </Card>
  );
}
