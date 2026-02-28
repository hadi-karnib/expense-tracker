import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { apiLogin, apiLogout, apiMe, apiRegister } from "../api/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  const refreshSession = useCallback(async () => {
    try {
      const data = await apiMe();
      const u = data?.user || null;
      setUser(u);
      return u;
    } catch {
      setUser(null);
      return null;
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  const login = useCallback(
    async ({ email, password }) => {
      const data = await apiLogin({ email, password });
      const u = await refreshSession();

      // If backend responded OK but we still can't read /me, it's almost always a cookie issue
      // (common on iOS Safari/Brave when frontend+backend are on different domains).
      if (!u) {
        throw new Error(
          "Login succeeded but session was not stored (cookie blocked). If you're on iPhone/iPad, deploy the Vercel /api proxy and set BACKEND_URL.",
        );
      }
      return data;
    },
    [refreshSession],
  );

  const register = useCallback(
    async ({ username, email, password }) => {
      const data = await apiRegister({ username, email, password });
      const u = await refreshSession();
      if (!u) {
        throw new Error(
          "Account created but session was not stored (cookie blocked). If you're on iPhone/iPad, deploy the Vercel /api proxy and set BACKEND_URL.",
        );
      }
      return data;
    },
    [refreshSession],
  );

  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      ready,
      user,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      refreshSession,
    }),
    [ready, user, login, register, logout, refreshSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
