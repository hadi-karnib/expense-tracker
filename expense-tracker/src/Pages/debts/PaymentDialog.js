import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

export default function PaymentDialog({ open, onClose, onPay, debt }) {
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setAmount("");
    setError("");
  }, [open, debt?._id]);

  const remaining = useMemo(() => Number(debt?.remainingAmount ?? 0), [debt]);

  const handlePay = async () => {
    setError("");
    if (!debt?._id) return setError("No debt selected.");

    const a = Number(amount);
    if (!Number.isFinite(a) || a <= 0)
      return setError("Payment amount must be a positive number.");
    if (a > remaining)
      return setError("Payment can't be greater than remaining amount.");

    await onPay(debt._id, a);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Record payment</DialogTitle>

      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Creditor: <b>{debt?.creditor ?? "-"}</b>
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Remaining: <b>${remaining.toFixed(2)}</b>
          </Typography>

          <TextField
            label="Payment amount (USD)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            inputMode="decimal"
            fullWidth
            autoFocus
          />

          {error ? (
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          ) : null}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} variant="text">
          Cancel
        </Button>
        <Button onClick={handlePay} variant="contained" disabled={!debt?._id}>
          Pay
        </Button>
      </DialogActions>
    </Dialog>
  );
}
