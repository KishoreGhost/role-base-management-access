import { render, screen } from "@testing-library/react";
import { vi } from "vitest";

import { RoleGate } from "@/components/role-gate";

const mockedUseAuth = vi.fn();
vi.mock("@/components/auth/auth-provider", () => ({
  useAuth: () => mockedUseAuth(),
}));

describe("RoleGate", () => {
  it("renders children for allowed role", () => {
    mockedUseAuth.mockReturnValue({ user: { role: "admin" } });
    render(<RoleGate allowed={["admin"]}><div>Allowed</div></RoleGate>);
    expect(screen.getByText("Allowed")).toBeInTheDocument();
  });

  it("renders denial for disallowed role", () => {
    mockedUseAuth.mockReturnValue({ user: { role: "viewer" } });
    render(<RoleGate allowed={["admin"]}><div>Allowed</div></RoleGate>);
    expect(screen.getByText(/do not have permission/i)).toBeInTheDocument();
  });
});
