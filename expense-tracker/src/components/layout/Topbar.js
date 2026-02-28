import React, { useMemo, useState } from "react";
import {
  AppBar,
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import DarkModeRoundedIcon from "@mui/icons-material/DarkModeRounded";
import LightModeRoundedIcon from "@mui/icons-material/LightModeRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import PrintRoundedIcon from "@mui/icons-material/PrintRounded";

import { useSettings } from "../../context/SettingsContext";
import { useAuth } from "../../context/AuthContext";

function titleFromPath(pathname) {
  if (pathname === "/") return "Dashboard";
  const map = {
    "/income": "Income",
    "/expenses": "Expenses",
    "/debts": "Debts",
    "/budgets": "Budgets",
    "/analytics": "Analytics",
    "/settings": "Settings",
    "/report": "Report",
  };
  return map[pathname] || "Expense Tracker";
}

export default function Topbar({ onOpenSidebar }) {
  const { mode, toggleMode, currency, setCurrency } = useSettings();
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const title = useMemo(() => titleFromPath(location.pathname), [location.pathname]);

  const [anchor, setAnchor] = useState(null);
  const open = Boolean(anchor);

  return (
    <AppBar position="sticky" elevation={0}>
      <Toolbar sx={{ gap: 1.5 }}>
        <IconButton onClick={onOpenSidebar} sx={{ display: { md: "none" } }}>
          <MenuRoundedIcon />
        </IconButton>

        <Typography variant="h6" sx={{ fontWeight: 900, letterSpacing: -0.3 }}>
          {title}
        </Typography>

        <Box sx={{ flex: 1 }} />

        <Button
          size="small"
          variant="outlined"
          endIcon={<KeyboardArrowDownRoundedIcon />}
          onClick={(e) => setAnchor(e.currentTarget)}
          sx={{ borderRadius: 999, px: 1.5 }}
        >
          {currency}
        </Button>

        <IconButton onClick={toggleMode} aria-label="toggle theme">
          {mode === "dark" ? <LightModeRoundedIcon /> : <DarkModeRoundedIcon />}
        </IconButton>

        <Button
          size="small"
          variant="contained"
          startIcon={<PrintRoundedIcon />}
          onClick={() => navigate("/report")}
          sx={{ borderRadius: 999 }}
        >
          Report
        </Button>

        <Button
          size="small"
          variant="text"
          onClick={logout}
          sx={{ borderRadius: 999 }}
        >
          Logout
        </Button>

        <Menu
          anchorEl={anchor}
          open={open}
          onClose={() => setAnchor(null)}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        >
          <MenuItem
            onClick={() => {
              setCurrency("USD");
              setAnchor(null);
            }}
          >
            USD
          </MenuItem>
          <MenuItem
            onClick={() => {
              setCurrency("LBP");
              setAnchor(null);
            }}
          >
            LBP
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
