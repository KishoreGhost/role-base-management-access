import { render, screen } from "@testing-library/react";
import { vi } from "vitest";

import { AuthGuard } from "@/components/auth/auth-guard";

const replace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
  usePathname: () => "/dashboard",
}));

const mockedUseAuth = vi.fn();
vi.mock("@/components/auth/auth-provider", () => ({
  useAuth: () => mockedUseAuth(),
}));

describe("AuthGuard", () => {
  beforeEach(() => {
    replace.mockReset();
  });

  it("renders loading state", () => {
    mockedUseAuth.mockReturnValue({ user: null, isLoading: true });
    render(<AuthGuard><div>Protected</div></AuthGuard>);
    expect(screen.getByText(/loading session/i)).toBeInTheDocument();
  });

  it("renders children when authenticated", () => {
    mockedUseAuth.mockReturnValue({ user: { role: "admin" }, isLoading: false });
    render(<AuthGuard><div>Protected</div></AuthGuard>);
    expect(screen.getByText("Protected")).toBeInTheDocument();
  });
});
