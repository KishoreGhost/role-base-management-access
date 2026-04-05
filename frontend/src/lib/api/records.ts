import { apiRequest } from "@/lib/api/client";

export type CategorySummary = {
  id: number;
  name: string;
  kind: string;
  color: string;
};

export type RecordItem = {
  id: number;
  title: string;
  amount: string;
  currency: string;
  entry_type: "income" | "expense";
  category_id: number;
  category: CategorySummary;
  subcategory: string | null;
  occurred_on: string;
  description: string | null;
  notes: string | null;
  payment_method: string | null;
  reference_code: string | null;
  status: "draft" | "posted" | "archived";
  created_by: number;
  updated_by: number | null;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
};

export type RecordPayload = {
  title: string;
  amount: string;
  currency: string;
  entry_type: "income" | "expense";
  category_id: number;
  subcategory?: string | null;
  occurred_on: string;
  description?: string | null;
  notes?: string | null;
  payment_method?: string | null;
  reference_code?: string | null;
  status: "draft" | "posted" | "archived";
};

export function getRecords() {
  return apiRequest<RecordItem[]>("/records");
}

export function getRecord(recordId: number) {
  return apiRequest<RecordItem>(`/records/${recordId}`);
}

export function createRecord(payload: RecordPayload) {
  return apiRequest<RecordItem>("/records", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateRecord(recordId: number, payload: Partial<RecordPayload>) {
  return apiRequest<RecordItem>(`/records/${recordId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function deleteRecord(recordId: number) {
  return apiRequest<void>(`/records/${recordId}`, { method: "DELETE" });
}
