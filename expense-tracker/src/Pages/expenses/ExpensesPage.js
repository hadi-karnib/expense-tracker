import React, { useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  Stack,
  TextField,
  Typography,
  Tooltip,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import UploadFileRoundedIcon from "@mui/icons-material/UploadFileRounded";

import { useExpensesData } from "../../hooks/useExpensesData";
import { downloadCsv } from "../../utils/csv";
import { fmtDate } from "../../utils/date";
import Money from "../../components/ui/Money";
import EmptyState from "../../components/ui/EmptyState";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import ExpenseDialog from "./ExpenseDialog";
import ImportCsvDialog from "../../components/import/ImportCsvDialog";

export default function ExpensesPage() {
  const { expenses, loading, error, reload, addExpense, updateExpense, deleteExpense } = useExpensesData();

  const [query, setQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [importOpen, setImportOpen] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [busy, setBusy] = useState(false);

  const categories = useMemo(() => {
    const set = new Set();
    expenses.forEach((e) => e.category && set.add(e.category));
    return Array.from(set).sort();
  }, [expenses]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return expenses;
    return expenses.filter((e) => {
      const text = `${e.category || ""} ${e.description || ""}`.toLowerCase();
      return text.includes(q);
    });
  }, [expenses, query]);

  const totalShown = useMemo(() => filtered.reduce((a, e) => a + Number(e.amount || 0), 0), [filtered]);

  const onExport = () => {
    const rows = filtered.map((e) => ({
      date: fmtDate(e.date, "yyyy-MM-dd"),
      category: e.category,
      amount_usd: e.amount,
      description: e.description || "",
    }));
    downloadCsv(`expenses-${fmtDate(new Date(), "yyyy-MM-dd")}.csv`, rows);
  };

  const openAdd = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (exp) => {
    setEditing(exp);
    setDialogOpen(true);
  };

  const askDelete = (id) => {
    setDeleteId(id);
    setConfirmOpen(true);
  };

  const doDelete = async () => {
    setBusy(true);
    try {
      await deleteExpense(deleteId);
      setConfirmOpen(false);
      setDeleteId(null);
    } catch {
      // handled by hook reload error, keep dialog closed
      setConfirmOpen(false);
    } finally {
      setBusy(false);
    }
  };

  const saveExpense = async (payload) => {
    setBusy(true);
    try {
      if (payload.id) {
        await updateExpense(payload);
      } else {
        await addExpense(payload);
      }
      setDialogOpen(false);
      setEditing(null);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Stack spacing={2}>
      <Card>
        <CardContent>
          <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} alignItems={{ md: "center" }} justifyContent="space-between">
            <Stack spacing={0.5}>
              <Typography variant="h6">Expenses</Typography>
              <Typography variant="body2" color="text.secondary">
                Add, search, edit, delete — and export to CSV.
              </Typography>
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center">
              <TextField
                size="small"
                placeholder="Search category or description…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                sx={{ width: { xs: "100%", md: 320 } }}
              />
<Button
                variant="outlined"
                startIcon={<UploadFileRoundedIcon />}
                onClick={() => setImportOpen(true)}
              >
                Import
              </Button>
              <Button
                variant="outlined"
                startIcon={<DownloadRoundedIcon />}
                onClick={onExport}
                disabled={!filtered.length}
              >
                Export
              </Button>
              <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={openAdd}>
                Add
              </Button>
            </Stack>
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            <Chip size="small" label={`Shown: ${filtered.length}`} />
            <Chip size="small" label={<span>Total: <Money amountUsd={totalShown} /></span>} />
            {error ? <Chip size="small" color="error" label={error} /> : null}
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          {loading ? (
            <Stack spacing={1}>
              {Array.from({ length: 7 }).map((_, i) => (
                <Box key={i} sx={{ height: 44, borderRadius: 2, bgcolor: "rgba(255,255,255,0.05)" }} />
              ))}
            </Stack>
          ) : filtered.length ? (
            <Stack spacing={1.25}>
              {filtered.map((e) => (
                <Stack
                  key={e._id}
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1}
                  alignItems={{ sm: "center" }}
                  justifyContent="space-between"
                  sx={{
                    p: 1.5,
                    borderRadius: 3,
                    border: "1px solid rgba(255,255,255,0.08)",
                    background: "rgba(255,255,255,0.03)",
                  }}
                >
                  <Stack spacing={0.2} sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 800 }} noWrap>
                      {e.category || "Expense"}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {fmtDate(e.date, "PPP")}
                      {e.description ? ` • ${e.description}` : ""}
                    </Typography>
                  </Stack>

                  <Stack direction="row" spacing={1} alignItems="center" justifyContent="flex-end">
                    <Typography sx={{ fontWeight: 900 }}>
                      <Money amountUsd={e.amount} />
                    </Typography>
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => openEdit(e)}>
                        <EditRoundedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" onClick={() => askDelete(e._id)}>
                        <DeleteRoundedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Stack>
              ))}
            </Stack>
          ) : (
            <EmptyState title="No expenses found" actionLabel="Add expense" onAction={openAdd} />
          )}
        </CardContent>
      </Card>

      <ImportCsvDialog
        open={importOpen}
        onClose={() => setImportOpen(false)}
        type="expense"
        onImported={() => {
          setImportOpen(false);
          reload();
        }}
      />

      <ExpenseDialog
        open={dialogOpen}
        onClose={() => {
          if (busy) return;
          setDialogOpen(false);
          setEditing(null);
        }}
        onSave={saveExpense}
        initial={editing}
        categories={categories}
      />

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => {
          if (busy) return;
          setConfirmOpen(false);
        }}
        title="Delete expense?"
        description="This action cannot be undone."
        confirmText="Delete"
        onConfirm={doDelete}
        loading={busy}
      />
    </Stack>
  );
}
