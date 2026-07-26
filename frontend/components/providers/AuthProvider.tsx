"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AuthContext, type RegisterData } from "@/lib/auth";
import { api } from "@/lib/api";
import type { AuthResponse, UserResponse } from "@/lib/types";

const TOKEN_KEY = "access_token";
const USER_KEY = "auth_user";

/**
 * Fallback when the stored user JSON is missing: rebuild a minimal user
 * from the JWT payload (sub = userId, email, role — no name claim).
 */
function decodeUserFromJwt(token: string): UserResponse | null {
  try {
    const payload: unknown = JSON.parse(
      atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
    );
    if (typeof payload !== "object" || payload === null) return null;
    const p = payload as Record<string, unknown>;
    const email = typeof p.email === "string" ? p.email : "";
    if (!email) return null;
    const id = typeof p.sub === "string" ? Number(p.sub) : 0;
    return {
      id: Number.isNaN(id) ? 0 : id,
      email,
      name: email.split("@")[0],
      role: typeof p.role === "string" ? p.role : "",
    };
  } catch {
    return null;
  }
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (storedToken) {
      api.setToken(storedToken);
      setToken(storedToken);
      const storedUser = localStorage.getItem(USER_KEY);
      let restored: UserResponse | null = null;
      if (storedUser) {
        try {
          restored = JSON.parse(storedUser) as UserResponse;
        } catch {
          restored = null;
        }
      }
      setUser(restored ?? decodeUserFromJwt(storedToken));
    }
    setInitializing(false);
  }, []);

  const applySession = useCallback((auth: AuthResponse) => {
    localStorage.setItem(TOKEN_KEY, auth.accessToken);
    localStorage.setItem(USER_KEY, JSON.stringify(auth.user));
    api.setToken(auth.accessToken);
    setToken(auth.accessToken);
    setUser(auth.user);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await api.post<AuthResponse>("/api/auth/login", { email, password });
      applySession(res.data);
    },
    [applySession]
  );

  const register = useCallback(
    async (data: RegisterData) => {
      const res = await api.post<AuthResponse>("/api/auth/register", data);
      applySession(res.data);
    },
    [applySession]
  );

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    api.clearToken();
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token),
      initializing,
      login,
      register,
      logout,
    }),
    [user, token, initializing, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
