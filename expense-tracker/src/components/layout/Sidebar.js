import React from "react";
import {
  Box,
  Chip,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";
import { NavLink } from "react-router-dom";

import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import PaidRoundedIcon from "@mui/icons-material/PaidRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import CreditCardRoundedIcon from "@mui/icons-material/CreditCardRounded";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import AccountBalanceWalletRoundedIcon from "@mui/icons-material/AccountBalanceWalletRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

const NAV = [
  { label: "Dashboard", to: "/", icon: <DashboardRoundedIcon /> },
  { label: "Income", to: "/income", icon: <PaidRoundedIcon /> },
  { label: "Expenses", to: "/expenses", icon: <ReceiptLongRoundedIcon /> },
  { label: "Debts", to: "/debts", icon: <CreditCardRoundedIcon /> },
  { label: "Budgets", to: "/budgets", icon: <AccountBalanceWalletRoundedIcon /> },
  { label: "Analytics", to: "/analytics", icon: <InsightsRoundedIcon /> },
  { label: "Settings", to: "/settings", icon: <SettingsRoundedIcon /> },
];

export default function Sidebar({ open, onClose }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const content = (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        p: 2,
        gap: 2,
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Stack spacing={0.2}>
          <Typography variant="h6" sx={{ fontWeight: 900, letterSpacing: -0.4 }}>
            Expense Tracker
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Clean money habits ✨
          </Typography>
        </Stack>
        {isMobile ? (
          <IconButton onClick={onClose} size="small">
            <CloseRoundedIcon />
          </IconButton>
        ) : null}
      </Stack>

      <Box
        sx={{
          borderRadius: 3,
          p: 2,
          background: `linear-gradient(135deg, ${alpha(
            theme.palette.primary.main,
            0.18
          )}, ${alpha(theme.palette.secondary.main, 0.12)})`,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.18)}`,
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <Chip
            size="small"
            label="Pro UI"
            color="primary"
            sx={{ fontWeight: 800 }}
          />
          <Typography variant="caption" color="text.secondary">
            Dark mode • USD/LBP • Reports
          </Typography>
        </Stack>
      </Box>

      <Divider />

      <List sx={{ px: 0.5 }}>
        {NAV.map((item) => (
          <ListItemButton
            key={item.to}
            component={NavLink}
            to={item.to}
            end={item.to === "/"}
            onClick={() => {
              if (isMobile) onClose?.();
            }}
            sx={{
              borderRadius: 3,
              mb: 0.5,
              "&.active": {
                backgroundColor: alpha(theme.palette.primary.main, 0.14),
                border: `1px solid ${alpha(theme.palette.primary.main, 0.24)}`,
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
            <ListItemText
              primary={item.label}
              primaryTypographyProps={{ fontWeight: 700 }}
            />
          </ListItemButton>
        ))}
      </List>

      <Box sx={{ flex: 1 }} />
      <Typography variant="caption" color="text.secondary" sx={{ px: 1 }}>
        Tip: Use Budgets + Analytics to stay consistent.
      </Typography>
    </Box>
  );

  const drawerWidth = 280;

  if (isMobile) {
    return (
      <Drawer
        open={open}
        onClose={onClose}
        PaperProps={{ sx: { width: drawerWidth } }}
      >
        {content}
      </Drawer>
    );
  }

  return (
    <Drawer
      variant="permanent"
      open
      PaperProps={{
        sx: {
          width: drawerWidth,
          borderRight: `1px solid ${alpha(
            theme.palette.mode === "dark" ? "#ffffff" : "#0b0f19",
            0.08
          )}`,
        },
      }}
    >
      {content}
    </Drawer>
  );
}
