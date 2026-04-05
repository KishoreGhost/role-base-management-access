"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useAuth } from "@/components/auth/auth-provider";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace(`/login?next=${encodeURIComponent(pathname || "/dashboard")}`);
    }
  }, [isLoading, pathname, router, user]);

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center text-slate-300">Loading session...</div>;
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
