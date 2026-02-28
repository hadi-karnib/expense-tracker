import { alpha, createTheme } from "@mui/material/styles";

export function buildTheme(mode = "dark") {
  const isDark = mode === "dark";

  const primary = { main: "#6366F1" }; // indigo
  const secondary = { main: "#22C55E" }; // green

  const bg = isDark
    ? {
        default: "#0b0f19",
        paper: alpha("#0b0f19", 0.72),
      }
    : {
        default: "#f6f7fb",
        paper: alpha("#ffffff", 0.85),
      };

  const text = isDark
    ? { primary: "#E6E8F2", secondary: alpha("#E6E8F2", 0.7) }
    : { primary: "#0b0f19", secondary: alpha("#0b0f19", 0.65) };

  return createTheme({
    palette: {
      mode,
      primary,
      secondary,
      background: bg,
      text,
      divider: alpha(isDark ? "#ffffff" : "#0b0f19", 0.08),
      success: { main: "#22C55E" },
      warning: { main: "#F59E0B" },
      error: { main: "#EF4444" },
      info: { main: "#60A5FA" },
    },
    shape: { borderRadius: 18 },
    typography: {
      fontFamily:
        '"Inter",-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif',
      h4: { fontWeight: 800, letterSpacing: -0.5 },
      h5: { fontWeight: 800, letterSpacing: -0.3 },
      h6: { fontWeight: 700 },
      subtitle1: { fontWeight: 600 },
      button: { textTransform: "none", fontWeight: 700 },
    },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            border: `1px solid ${alpha(isDark ? "#ffffff" : "#0b0f19", 0.08)}`,
            backdropFilter: "blur(14px)",
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            border: `1px solid ${alpha(isDark ? "#ffffff" : "#0b0f19", 0.08)}`,
            backdropFilter: "blur(14px)",
          },
        },
      },
      MuiButton: {
        defaultProps: {
          disableElevation: true,
        },
        styleOverrides: {
          root: {
            borderRadius: 14,
            paddingInline: 14,
            paddingBlock: 10,
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: ({ theme }) => ({
            borderRadius: 14,
            backgroundColor: alpha(
              theme.palette.mode === "dark" ? "#ffffff" : "#0b0f19",
              theme.palette.mode === "dark" ? 0.04 : 0.03
            ),
          }),
          notchedOutline: ({ theme }) => ({
            borderColor: alpha(
              theme.palette.mode === "dark" ? "#ffffff" : "#0b0f19",
              0.12
            ),
          }),
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: ({ theme }) => ({
            background: alpha(theme.palette.background.default, 0.65),
            backdropFilter: "blur(16px)",
            borderBottom: `1px solid ${alpha(
              theme.palette.mode === "dark" ? "#ffffff" : "#0b0f19",
              0.08
            )}`,
          }),
        },
      },
    },
  });
}
