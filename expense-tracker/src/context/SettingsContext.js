import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const SettingsContext = createContext(null);

const STORAGE_KEY = "expense-tracker:settings:v1";

const DEFAULTS = {
  mode: "dark", // "light" | "dark"
  currency: "USD", // "USD" | "LBP"
  lbpRate: 89000, // 1 USD -> LBP
};

export function SettingsProvider({ children }) {
  const [mode, setMode] = useState(DEFAULTS.mode);
  const [currency, setCurrency] = useState(DEFAULTS.currency);
  const [lbpRate, setLbpRate] = useState(DEFAULTS.lbpRate);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed?.mode) setMode(parsed.mode);
      if (parsed?.currency) setCurrency(parsed.currency);
      if (typeof parsed?.lbpRate === "number") setLbpRate(parsed.lbpRate);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ mode, currency, lbpRate })
      );
    } catch {
      // ignore
    }
  }, [mode, currency, lbpRate]);

  const value = useMemo(
    () => ({
      mode,
      setMode,
      toggleMode: () => setMode((m) => (m === "dark" ? "light" : "dark")),
      currency,
      setCurrency,
      lbpRate,
      setLbpRate,
    }),
    [mode, currency, lbpRate]
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}
