import React, { useState } from "react";
import { Box, Container } from "@mui/material";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function AppLayout() {
  const [open, setOpen] = useState(false);

  return (
    <Box sx={{ display: "flex", minHeight: "100%" }}>
      <Sidebar open={open} onClose={() => setOpen(false)} />

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Topbar onOpenSidebar={() => setOpen(true)} />

        <Container maxWidth="xl" sx={{ py: 3 }}>
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
}
