import React, { useEffect, useMemo, useState } from "react";
import { useMediaQuery, useTheme } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";

const DEFAULT_CATEGORIES = [
  "Food",
  "Transport",
  "Rent",
  "Bills",
  "Shopping",
  "Health",
  "Entertainment",
  "Education",
  "Other",
];

export default function ExpenseDialog({ open, onClose, onSave, initial, categories }) {
  const theme = useTheme();
  const isSm = useMediaQuery(theme.breakpoints.down("sm"));
  const isEdit = !!initial?._id;

  const categoryOptions = useMemo(() => {
    const set = new Set(DEFAULT_CATEGORIES);
    (categories || []).forEach((c) => c && set.add(c));
    return Array.from(set);
  }, [categories]);

  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(null);
  const [description, setDescription] = useState("");

  const [isRecurring, setIsRecurring] = useState(false);
  const [dayOfMonth, setDayOfMonth] = useState("1");

  useEffect(() => {
    if (!open) return;

    setCategory(initial?.category || "");
    setAmount(initial?.amount != null ? String(initial.amount) : "");
    setDate(initial?.date ? new Date(initial.date) : new Date());
    setDescription(initial?.description || "");

    // Recurring templates are create-only in this UI
    setIsRecurring(false);
    setDayOfMonth("1");
  }, [open, initial]);

  const canSave = Number(amount) > 0 && !!date && !!category;

  const handleSave = async () => {
    const payload = {
      ...(isEdit ? { id: initial._id } : {}),
      category: category.trim() || "Other",
      amount: Number(amount),
      date: date ? new Date(date).toISOString() : new Date().toISOString(),
      description: description.trim() || undefined,

      // Recurring (create-only)
      ...(isEdit
        ? {}
        : isRecurring
        ? { isRecurring: true, recurring: { freq: "monthly", dayOfMonth: Number(dayOfMonth || 1) } }
        : {}),
    };

    await onSave(payload);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" fullScreen={isSm}>
      <DialogTitle>{isEdit ? "Edit Expense" : "Add Expense"}</DialogTitle>

      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <TextField
            select
            label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            size="small"
          >
            {categoryOptions.map((c) => (
              <MenuItem key={c} value={c}>
                {c}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            inputMode="decimal"
            placeholder="0.00"
            size="small"
            helperText="Numbers only"
          />

          <DatePicker
            label="Date"
            value={date}
            onChange={(v) => setDate(v)}
            slotProps={{
              textField: { size: "small", fullWidth: true },
            }}
          />

          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            size="small"
            multiline
            minRows={2}
          />

          {!isEdit && (
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="body2">Recurring monthly</Typography>
              <Switch checked={isRecurring} onChange={(e) => setIsRecurring(e.target.checked)} />
            </Stack>
          )}

          {!isEdit && isRecurring && (
            <TextField
              label="Day of month"
              value={dayOfMonth}
              onChange={(e) => setDayOfMonth(e.target.value)}
              inputMode="numeric"
              placeholder="1"
              size="small"
              helperText="Example: 1 = first day of month"
            />
          )}

          {!canSave && (
            <Typography variant="caption" color="text.secondary">
              Category, amount, and date are required.
            </Typography>
          )}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={!canSave} variant="contained">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
