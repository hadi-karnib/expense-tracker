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
      setUser(data?.user || null);
    } catch {
      setUser(null);
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
      await refreshSession();
      return data;
    },
    [refreshSession],
  );

  const register = useCallback(
    async ({ username, email, password }) => {
      const data = await apiRegister({ username, email, password });
      await refreshSession();
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
