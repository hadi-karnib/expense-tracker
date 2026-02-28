import React from "react";
import { Card, CardContent, Stack, Typography } from "@mui/material";

export default function StatCard({ label, value, hint, icon }) {
  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2}>
          <Stack spacing={0.75}>
            <Typography variant="body2" color="text.secondary">
              {label}
            </Typography>
            <Typography variant="h5">{value}</Typography>
            {hint ? (
              <Typography variant="body2" color="text.secondary">
                {hint}
              </Typography>
            ) : null}
          </Stack>
          {icon ? <span>{icon}</span> : null}
        </Stack>
      </CardContent>
    </Card>
  );
}
