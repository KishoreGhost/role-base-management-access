import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import { LoginForm } from "@/components/auth/login-form";

const replace = vi.fn();
const login = vi.fn();
const consumeAuthMessage = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
  useSearchParams: () => ({ get: () => null }),
}));

vi.mock("@/components/auth/auth-provider", () => ({
  useAuth: () => ({ login, user: null }),
  consumeAuthMessage: () => consumeAuthMessage(),
}));

describe("LoginForm", () => {
  beforeEach(() => {
    replace.mockReset();
    login.mockReset();
    consumeAuthMessage.mockReset();
  });

  it("submits credentials and redirects to dashboard", async () => {
    login.mockResolvedValue(undefined);
    consumeAuthMessage.mockReturnValue(null);
    const user = userEvent.setup();

    render(<LoginForm />);

    await user.clear(screen.getByLabelText(/email/i));
    await user.type(screen.getByLabelText(/email/i), "admin@finsightcrm.com");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(login).toHaveBeenCalledWith("admin@finsightcrm.com", "Password123!");
  });

  it("shows session-expired message when present", () => {
    consumeAuthMessage.mockReturnValue("Your session expired. Please sign in again.");

    render(<LoginForm />);

    expect(screen.getByText(/session expired/i)).toBeInTheDocument();
  });
});
