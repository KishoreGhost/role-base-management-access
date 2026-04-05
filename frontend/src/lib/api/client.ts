import { dispatchAuthExpired } from "@/lib/auth/events";
import { getToken } from "@/lib/auth/token";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://role-base-management-access.onrender.com/api";

let suppressNextAuthExpiredEvent = false;

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export function suppressAuthExpiredRedirectOnce() {
  suppressNextAuthExpiredEvent = true;
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  useAuth = true,
): Promise<T> {
  const headers = new Headers(options.headers ?? {});

  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (useAuth) {
    const token = getToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    cache: "no-store",
  });

  if (!response.ok) {
    let message = "Request failed";
    try {
      const payload = (await response.json()) as { detail?: string };
      message = payload.detail ?? message;
    } catch {
      message = response.statusText || message;
    }

    if (response.status === 401) {
      if (suppressNextAuthExpiredEvent) {
        suppressNextAuthExpiredEvent = false;
      } else {
        dispatchAuthExpired();
      }
    } else if (suppressNextAuthExpiredEvent) {
      suppressNextAuthExpiredEvent = false;
    }

    throw new ApiError(message, response.status);
  }

  if (suppressNextAuthExpiredEvent) {
    suppressNextAuthExpiredEvent = false;
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
