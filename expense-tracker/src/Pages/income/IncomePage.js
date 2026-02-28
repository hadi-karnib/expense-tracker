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

import { useIncomeData } from "../../hooks/useIncomeData";
import { downloadCsv } from "../../utils/csv";
import { fmtDate } from "../../utils/date";
import Money from "../../components/ui/Money";
import EmptyState from "../../components/ui/EmptyState";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import IncomeDialog from "./IncomeDialog";
import ImportCsvDialog from "../../components/import/ImportCsvDialog";

export default function IncomePage() {
  const {
    income,
    loading,
    error,
    reload,
    addIncome,
    updateIncome,
    deleteIncome,
  } = useIncomeData();

  const [query, setQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [busy, setBusy] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return income;
    return income.filter((i) => {
      const text = `${i.source || ""} ${i.note || ""}`.toLowerCase();
      return text.includes(q);
    });
  }, [income, query]);

  const totalShown = useMemo(
    () => filtered.reduce((a, i) => a + Number(i.amount || 0), 0),
    [filtered]
  );

  const onExport = () => {
    const rows = filtered.map((i) => ({
      date: fmtDate(i.date, "yyyy-MM-dd"),
      type: i.source,
      amount_usd: i.amount,
      note: i.note || "",
    }));
    downloadCsv(`income-${fmtDate(new Date(), "yyyy-MM-dd")}.csv`, rows);
  };

  const openAdd = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (inc) => {
    setEditing(inc);
    setDialogOpen(true);
  };

  const askDelete = (id) => {
    setDeleteId(id);
    setConfirmOpen(true);
  };

  const doDelete = async () => {
    setBusy(true);
    try {
      await deleteIncome(deleteId);
      setConfirmOpen(false);
      setDeleteId(null);
    } catch {
      setConfirmOpen(false);
    } finally {
      setBusy(false);
    }
  };

  const saveIncome = async (payload) => {
    setBusy(true);
    try {
      if (payload.id) {
        await updateIncome(payload);
      } else {
        await addIncome(payload);
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
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={1.5}
            alignItems={{ md: "center" }}
            justifyContent="space-between"
          >
            <Stack spacing={0.5}>
              <Typography variant="h6">Income</Typography>
              <Typography variant="body2" color="text.secondary">
                Add salary and other income — tracked in your backend.
              </Typography>
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center">
              <TextField
                size="small"
                placeholder="Search type or note…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                sx={{ width: { xs: "100%", md: 320 } }}
              />
<Button
                variant="outlined"
                startIcon={<UploadFileRoundedIcon />}
                onClick={() => setImportOpen(true)}
              >
                Import CSV
              </Button>

              <Button
                variant="outlined"
                startIcon={<DownloadRoundedIcon />}
                onClick={onExport}
                disabled={!filtered.length}
              >
                Export
              </Button>
              <Button
                variant="contained"
                startIcon={<AddRoundedIcon />}
                onClick={openAdd}
              >
                Add
              </Button>
            </Stack>
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            <Chip size="small" label={`Shown: ${filtered.length}`} />
            <Chip
              size="small"
              label={
                <span>
                  Total: <Money amountUsd={totalShown} />
                </span>
              }
            />
            {error ? <Chip size="small" color="error" label={error} /> : null}
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          {loading ? (
            <Stack spacing={1}>
              {Array.from({ length: 7 }).map((_, i) => (
                <Box
                  key={i}
                  sx={{
                    height: 44,
                    borderRadius: 2,
                    bgcolor: "rgba(255,255,255,0.05)",
                  }}
                />
              ))}
            </Stack>
          ) : filtered.length ? (
            <Stack spacing={1.25}>
              {filtered.map((i) => (
                <Stack
                  key={i._id}
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
                      {i.source || "Income"}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {fmtDate(i.date, "PPP")}
                      {i.note ? ` • ${i.note}` : ""}
                    </Typography>
                  </Stack>

                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    justifyContent="flex-end"
                  >
                    <Typography sx={{ fontWeight: 900 }}>
                      <Money amountUsd={i.amount} />
                    </Typography>
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => openEdit(i)}>
                        <EditRoundedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" onClick={() => askDelete(i._id)}>
                        <DeleteRoundedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Stack>
              ))}
            </Stack>
          ) : (
            <EmptyState
              title="No income yet"
              description="Add your salary (or any income) to show net balance on the Dashboard."
              actionLabel="Add income"
              onAction={openAdd}
            />
          )}
        </CardContent>
      </Card>

      <ImportCsvDialog
        open={importOpen}
        onClose={() => setImportOpen(false)}
        type="income"
        onImported={() => {
          setImportOpen(false);
          reload();
        }}
      />

      <IncomeDialog
        open={dialogOpen}
        onClose={() => {
          if (busy) return;
          setDialogOpen(false);
          setEditing(null);
        }}
        onSave={saveIncome}
        initial={editing}
      />

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => {
          if (busy) return;
          setConfirmOpen(false);
        }}
        title="Delete income record?"
        description="This action cannot be undone."
        confirmText="Delete"
        onConfirm={doDelete}
        loading={busy}
      />
    </Stack>
  );
}
