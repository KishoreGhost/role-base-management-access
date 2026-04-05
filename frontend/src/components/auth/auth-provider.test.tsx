import { render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";

import { AuthProvider, useAuth } from "@/components/auth/auth-provider";
import { ApiError } from "@/lib/api/client";

const getCurrentUser = vi.fn();
const loginRequest = vi.fn();
const setToken = vi.fn();
const clearToken = vi.fn();
const subscribeToAuthExpired = vi.fn();

vi.mock("@/lib/api/auth", () => ({
  getCurrentUser: (...args: unknown[]) => getCurrentUser(...args),
  login: (...args: unknown[]) => loginRequest(...args),
}));

vi.mock("@/lib/auth/token", () => ({
  getToken: () => "token",
  setToken: (...args: unknown[]) => setToken(...args),
  clearToken: (...args: unknown[]) => clearToken(...args),
}));

vi.mock("@/lib/auth/events", () => ({
  subscribeToAuthExpired: (...args: unknown[]) => subscribeToAuthExpired(...args),
}));

function Consumer() {
  const { user, isLoading } = useAuth();
  return <div>{isLoading ? "loading" : user?.email ?? "no-user"}</div>;
}

describe("AuthProvider", () => {
  beforeEach(() => {
    getCurrentUser.mockReset();
    loginRequest.mockReset();
    setToken.mockReset();
    clearToken.mockReset();
    subscribeToAuthExpired.mockReset();
    window.sessionStorage.clear();
  });

  it("hydrates the current user from token", async () => {
    getCurrentUser.mockResolvedValue({
      id: 1,
      full_name: "Ada Admin",
      email: "admin@finsightcrm.com",
      role: "admin",
      status: "active",
      department: "Leadership",
    });
    subscribeToAuthExpired.mockReturnValue(() => {});

    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>,
    );

    await waitFor(() => expect(screen.getByText("admin@finsightcrm.com")).toBeInTheDocument());
  });

  it("stores session-expired message when hydration receives 401", async () => {
    getCurrentUser.mockRejectedValue(new ApiError("Unauthorized", 401));
    subscribeToAuthExpired.mockReturnValue(() => {});

    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>,
    );

    await waitFor(() => expect(screen.getByText("no-user")).toBeInTheDocument());
    expect(clearToken).toHaveBeenCalled();
    expect(window.sessionStorage.getItem("finsight_auth_message")).toBe("Your session expired. Please sign in again.");
  });
});
