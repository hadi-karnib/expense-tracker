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
  TextField,
  Typography,
} from "@mui/material";

const DEFAULT_SOURCES = ["Salary", "Freelance", "Business", "Gift", "Other"];

export default function IncomeDialog({ open, onClose, onSave, initial }) {
  const theme = useTheme();
  const isSm = useMediaQuery(theme.breakpoints.down("sm"));
  const isEdit = !!initial?._id;

  const sourceOptions = useMemo(() => DEFAULT_SOURCES, []);

  const [source, setSource] = useState("Salary");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(null);
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!open) return;

    setSource(initial?.source || "Salary");
    setAmount(initial?.amount != null ? String(initial.amount) : "");
    setDate(initial?.date ? new Date(initial.date) : new Date());
    setNote(initial?.note || "");
  }, [open, initial]);

  const canSave = Number(amount) > 0 && !!date;

  const handleSave = async () => {
    const payload = {
      ...(isEdit ? { id: initial._id } : {}),
      source: (source || "Other").trim() || "Other",
      amount: Number(amount),
      date: date ? new Date(date).toISOString() : new Date().toISOString(),
      note: note.trim() || undefined,
    };
    await onSave(payload);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" fullScreen={isSm}>
      <DialogTitle>{isEdit ? "Edit Income" : "Add Income"}</DialogTitle>

      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <TextField
            select
            label="Source"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            size="small"
          >
            {sourceOptions.map((s) => (
              <MenuItem key={s} value={s}>
                {s}
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
            label="Note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            size="small"
            multiline
            minRows={2}
          />

          {!canSave && (
            <Typography variant="caption" color="text.secondary">
              Amount and date are required.
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
