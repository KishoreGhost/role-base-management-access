import { apiRequest } from "@/lib/api/client";
import type { Role, UserStatus } from "@/lib/auth/types";

export type UserItem = {
  id: number;
  full_name: string;
  email: string;
  role: Role;
  status: UserStatus;
  department: string;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
};

export type UserPayload = {
  full_name: string;
  email: string;
  role: Role;
  status: UserStatus;
  department: string;
  password?: string;
};

export function getUsers() {
  return apiRequest<UserItem[]>("/users");
}

export function createUser(payload: Required<UserPayload>) {
  return apiRequest<UserItem>("/users", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateUser(userId: number, payload: UserPayload) {
  return apiRequest<UserItem>(`/users/${userId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}
