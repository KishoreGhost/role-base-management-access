import { apiRequest } from "@/lib/api/client";
import type { CurrentUser, LoginResponse } from "@/lib/auth/types";

export function login(email: string, password: string) {
  return apiRequest<LoginResponse>(
    "/auth/login",
    {
      method: "POST",
      body: JSON.stringify({ email, password }),
    },
    false,
  );
}

export function getCurrentUser() {
  return apiRequest<CurrentUser>("/auth/me");
}
