import { apiRequest } from "@/lib/api/client";

export type CategoryItem = {
  id: number;
  name: string;
  kind: "income" | "expense";
  color: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type CategoryPayload = {
  name: string;
  kind: "income" | "expense";
  color: string;
  is_active: boolean;
};

export function getCategories() {
  return apiRequest<CategoryItem[]>("/categories");
}

export function createCategory(payload: CategoryPayload) {
  return apiRequest<CategoryItem>("/categories", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateCategory(categoryId: number, payload: Partial<CategoryPayload>) {
  return apiRequest<CategoryItem>(`/categories/${categoryId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}
