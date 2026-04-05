"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { getCurrentUser, login as loginRequest } from "@/lib/api/auth";
import { ApiError, suppressAuthExpiredRedirectOnce } from "@/lib/api/client";
import { subscribeToAuthExpired } from "@/lib/auth/events";
import { clearToken, getToken, setToken } from "@/lib/auth/token";
import type { CurrentUser } from "@/lib/auth/types";

const AUTH_MESSAGE_KEY = "finsight_auth_message";
export const SESSION_EXPIRED_MESSAGE = "Your session expired. Please sign in again.";

type AuthContextValue = {
  user: CurrentUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<CurrentUser>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function setAuthMessage(message: string) {
  if (typeof window !== "undefined") {
    window.sessionStorage.setItem(AUTH_MESSAGE_KEY, message);
  }
}

export function consumeAuthMessage() {
  if (typeof window === "undefined") {
    return null;
  }

  const message = window.sessionStorage.getItem(AUTH_MESSAGE_KEY);
  if (message) {
    window.sessionStorage.removeItem(AUTH_MESSAGE_KEY);
  }
  return message;
}

function clearAuthMessage() {
  if (typeof window !== "undefined") {
    window.sessionStorage.removeItem(AUTH_MESSAGE_KEY);
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleExpiredSession = useCallback((message: string) => {
    clearToken();
    setUser(null);
    setAuthMessage(message || SESSION_EXPIRED_MESSAGE);
  }, []);

  const refreshUser = useCallback(async () => {
    const currentUser = await getCurrentUser();
    setUser(currentUser);
    return currentUser;
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToAuthExpired((message) => {
      handleExpiredSession(message);
    });
    return unsubscribe;
  }, [handleExpiredSession]);

  useEffect(() => {
    let cancelled = false;

    async function hydrateSession() {
      const token = getToken();
      if (!token) {
        if (!cancelled) {
          setIsLoading(false);
        }
        return;
      }

      try {
        const currentUser = await getCurrentUser();
        if (!cancelled) {
          setUser(currentUser);
        }
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          clearToken();
          if (!cancelled) {
            setUser(null);
          }
          setAuthMessage(SESSION_EXPIRED_MESSAGE);
        } else {
          throw error;
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void hydrateSession();

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    suppressAuthExpiredRedirectOnce();
    const response = await loginRequest(email, password);
    setToken(response.access_token);
    clearAuthMessage();
    setUser(response.user);
  }, []);

  const logout = useCallback(() => {
    clearToken();
    clearAuthMessage();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, isLoading, login, logout, refreshUser }),
    [user, isLoading, login, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
