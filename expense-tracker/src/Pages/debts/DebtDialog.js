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

export default function DebtDialog({ open, onClose, onSave, initial }) {
  const isEdit = !!initial;

  const [creditor, setCreditor] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [remainingAmount, setRemainingAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState("");

  // when opening or switching initial, hydrate fields
  useEffect(() => {
    if (!open) return;

    const creditorInit = initial?.creditor ?? "";
    const totalInit = initial?.totalAmount ?? "";
    const remainingInit = initial?.remainingAmount ?? "";
    const dueInit = initial?.dueDate
      ? new Date(initial.dueDate).toISOString().slice(0, 10)
      : "";

    setCreditor(creditorInit);
    setTotalAmount(String(totalInit));
    // If remaining is missing, default to total
    setRemainingAmount(
      String(
        remainingInit !== "" &&
          remainingInit !== null &&
          remainingInit !== undefined
          ? remainingInit
          : totalInit,
      ),
    );
    setDueDate(dueInit);
    setError("");
  }, [open, initial]);

  const numbers = useMemo(() => {
    const t = Number(totalAmount);
    const r = Number(remainingAmount);
    return { t, r, tValid: Number.isFinite(t), rValid: Number.isFinite(r) };
  }, [totalAmount, remainingAmount]);

  const handleSave = async () => {
    setError("");

    if (!creditor.trim()) return setError("Creditor is required.");
    if (!numbers.tValid || numbers.t <= 0)
      return setError("Total amount must be a positive number.");
    if (!numbers.rValid || numbers.r < 0)
      return setError("Remaining amount must be 0 or more.");
    if (numbers.r > numbers.t)
      return setError("Remaining amount can't be greater than total.");
    if (!dueDate) return setError("Due date is required.");

    const payload = {
      // keep id shape compatible with your DebtsPage check (payload.id)
      id: initial?._id || initial?.id,
      creditor: creditor.trim(),
      totalAmount: numbers.t,
      remainingAmount: numbers.r,
      dueDate: new Date(dueDate).toISOString(),
    };

    await onSave(payload);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{isEdit ? "Edit debt" : "Add debt"}</DialogTitle>

      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <TextField
            label="Creditor"
            value={creditor}
            onChange={(e) => setCreditor(e.target.value)}
            autoFocus
            fullWidth
          />

          <TextField
            label="Total amount (USD)"
            value={totalAmount}
            onChange={(e) => setTotalAmount(e.target.value)}
            inputMode="decimal"
            fullWidth
          />

          <TextField
            label="Remaining amount (USD)"
            value={remainingAmount}
            onChange={(e) => setRemainingAmount(e.target.value)}
            inputMode="decimal"
            fullWidth
            helperText="Tip: for a new debt, remaining usually equals total."
          />

          <TextField
            label="Due date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
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
        <Button onClick={handleSave} variant="contained">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
