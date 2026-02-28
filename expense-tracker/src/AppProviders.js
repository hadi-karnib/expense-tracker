import React, { useMemo } from "react";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFnsV3 } from "@mui/x-date-pickers/AdapterDateFnsV3";
import { buildTheme } from "./theme/appTheme";
import { SettingsProvider, useSettings } from "./context/SettingsContext";
import { AuthProvider } from "./context/AuthContext";

function ThemeBridge({ children }) {
  const { mode } = useSettings();
  const theme = useMemo(() => buildTheme(mode), [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDateFnsV3}>
        {children}
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default function AppProviders({ children }) {
  return (
    <SettingsProvider>
      <ThemeBridge>
        <AuthProvider>{children}</AuthProvider>
      </ThemeBridge>
    </SettingsProvider>
  );
}
