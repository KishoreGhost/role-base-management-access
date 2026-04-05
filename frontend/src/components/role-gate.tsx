"use client";

import { Card } from "@/components/ui/card";
import { useAuth } from "@/components/auth/auth-provider";
import type { Role } from "@/lib/auth/types";

export function RoleGate({
  allowed,
  children,
}: {
  allowed: Role[];
  children: React.ReactNode;
}) {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  if (!allowed.includes(user.role)) {
    return (
      <Card className="text-sm text-slate-300">
        You do not have permission to view this page.
      </Card>
    );
  }

  return <>{children}</>;
}
