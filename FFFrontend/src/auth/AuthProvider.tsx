// FFFrontend/src/auth/AuthProvider.tsx
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { authApi } from "../api/endpoints";
import type { ApiError, Me, UserRole } from "../api/types";

type AuthState = {
  token: string | null;
  me: Me | null;
  loading: boolean;
  error: ApiError | null;
};

type AuthCtx = AuthState & {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, role: Exclude<UserRole, "ADMIN">) => Promise<void>;
  logout: () => Promise<void>;
  setToken: (t: string | null) => void;
};

const Ctx = createContext<AuthCtx | null>(null);
const LS_KEY = "jobsearch_token";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = useState<string | null>(() => localStorage.getItem(LS_KEY));
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<ApiError | null>(null);

  useEffect(() => {
    let alive = true;

    async function boot() {
      setLoading(true);
      setError(null);

      try {
        if (!token) {
          if (alive) setMe(null);
          return;
        }

        const res = await authApi.me(token); // { user }
        if (alive) setMe(res.user);
      } catch (e: any) {
        if (alive) {
          setError(e);
          setMe(null);
          setTokenState(null);
          localStorage.removeItem(LS_KEY);
        }
      } finally {
        if (alive) setLoading(false);
      }
    }

    boot();
    return () => {
      alive = false;
    };
  }, [token]);

  const value = useMemo<AuthCtx>(
    () => ({
      token,
      me,
      loading,
      error,

      setToken: (t) => {
        setTokenState(t);
        if (t) localStorage.setItem(LS_KEY, t);
        else localStorage.removeItem(LS_KEY);
      },

      login: async (email, password) => {
        const res = await authApi.login({ email, password });
        setTokenState(res.token);
        localStorage.setItem(LS_KEY, res.token);

        const meRes = await authApi.me(res.token);
        setMe(meRes.user);
      },

      register: async (email, password, role) => {
        const res = await authApi.register({ email, password, role });
        setTokenState(res.token);
        localStorage.setItem(LS_KEY, res.token);

        const meRes = await authApi.me(res.token);
        setMe(meRes.user);
      },

      logout: async () => {
        setTokenState(null);
        localStorage.removeItem(LS_KEY);
        setMe(null);
      },
    }),
    [token, me, loading, error]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}