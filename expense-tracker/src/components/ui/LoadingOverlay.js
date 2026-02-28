import React from "react";
import { Backdrop, CircularProgress } from "@mui/material";

export default function LoadingOverlay({ open }) {
  return (
    <Backdrop open={open} sx={{ zIndex: (t) => t.zIndex.drawer + 1000 }}>
      <CircularProgress />
    </Backdrop>
  );
}
