import React from "react";
import { Button, Stack, Typography } from "@mui/material";

export default function EmptyState({
  title = "Nothing here yet",
  description = "Add your first item to get started.",
  actionLabel,
  onAction,
}) {
  return (
    <Stack
      spacing={1}
      alignItems="center"
      justifyContent="center"
      sx={{ py: 8, textAlign: "center" }}
    >
      <Typography variant="h6">{title}</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 520 }}>
        {description}
      </Typography>
      {actionLabel ? (
        <Button variant="contained" onClick={onAction} sx={{ mt: 1.5 }}>
          {actionLabel}
        </Button>
      ) : null}
    </Stack>
  );
}
