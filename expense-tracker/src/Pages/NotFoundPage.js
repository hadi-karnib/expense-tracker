import React from "react";
import { Button, Card, CardContent, Stack, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <Card>
      <CardContent>
        <Stack spacing={1.25} alignItems="flex-start">
          <Typography variant="h5">Page not found</Typography>
          <Typography color="text.secondary">
            The page you’re looking for doesn’t exist.
          </Typography>
          <Button variant="contained" component={RouterLink} to="/">
            Go to dashboard
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
