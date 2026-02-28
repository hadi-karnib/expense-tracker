import React, { useMemo, useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  Stack,
  Typography,
  Tooltip,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";

import { useDebtsData } from "../../hooks/useDebtsData";
import Money from "../../components/ui/Money";
import EmptyState from "../../components/ui/EmptyState";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { downloadCsv } from "../../utils/csv";
import { fmtDate } from "../../utils/date";
import DebtDialog from "./DebtDialog";
import PaymentDialog from "./PaymentDialog";

export default function DebtsPage() {
  const { debts, loading, error, addDebt, updateDebt, deleteDebt, payDebt } = useDebtsData();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const [paymentOpen, setPaymentOpen] = useState(false);
  const [payingDebt, setPayingDebt] = useState(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const [busy, setBusy] = useState(false);

  const totals = useMemo(() => {
    const total = debts.reduce((acc, d) => acc + Number(d.totalAmount || 0), 0);
    const remaining = debts.reduce((acc, d) => acc + Number(d.remainingAmount || 0), 0);
    return { total, remaining };
  }, [debts]);

  const onExport = () => {
    const rows = debts.map((d) => ({
      creditor: d.creditor,
      total_usd: d.totalAmount,
      remaining_usd: d.remainingAmount,
      due_date: fmtDate(d.dueDate, "yyyy-MM-dd"),
      payments_count: (d.payments || []).length,
    }));
    downloadCsv(`debts-${fmtDate(new Date(), "yyyy-MM-dd")}.csv`, rows);
  };

  const openAdd = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (d) => {
    setEditing(d);
    setDialogOpen(true);
  };

  const askDelete = (id) => {
    setDeleteId(id);
    setConfirmOpen(true);
  };

  const doDelete = async () => {
    setBusy(true);
    try {
      await deleteDebt(deleteId);
      setConfirmOpen(false);
      setDeleteId(null);
    } finally {
      setBusy(false);
    }
  };

  const saveDebt = async (payload) => {
    setBusy(true);
    try {
      if (payload.id) await updateDebt(payload);
      else await addDebt(payload);
      setDialogOpen(false);
      setEditing(null);
    } finally {
      setBusy(false);
    }
  };

  const openPayment = (d) => {
    setPayingDebt(d);
    setPaymentOpen(true);
  };

  const doPay = async (id, amount) => {
    setBusy(true);
    try {
      await payDebt(id, amount);
      setPaymentOpen(false);
      setPayingDebt(null);
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
              <Typography variant="h6">Debts</Typography>
              <Typography variant="body2" color="text.secondary">
                Track what you owe, record payments, and keep history.
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <Button
                variant="outlined"
                startIcon={<DownloadRoundedIcon />}
                onClick={onExport}
                disabled={!debts.length}
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
            <Chip size="small" label={<span>Total: <Money amountUsd={totals.total} /></span>} />
            <Chip size="small" label={<span>Remaining: <Money amountUsd={totals.remaining} /></span>} />
            {error ? <Chip size="small" color="error" label={error} /> : null}
          </Stack>
        </CardContent>
      </Card>

      {loading ? (
        <Grid container spacing={2}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Grid item xs={12} md={6} lg={4} key={i}>
              <Card><CardContent><Box sx={{ height: 140, bgcolor: "rgba(255,255,255,0.05)", borderRadius: 3 }} /></CardContent></Card>
            </Grid>
          ))}
        </Grid>
      ) : debts.length ? (
        <Grid container spacing={2}>
          {debts.map((d) => {
            const paid = Number(d.totalAmount || 0) - Number(d.remainingAmount || 0);
            const pct = d.totalAmount ? (paid / Number(d.totalAmount)) * 100 : 0;
            const isPaidOff = Number(d.remainingAmount || 0) <= 0;
            return (
              <Grid item xs={12} md={6} lg={4} key={d._id}>
                <Card sx={{ height: "100%" }}>
                  <CardContent>
                    <Stack spacing={1.25}>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                        <Stack spacing={0.2} sx={{ minWidth: 0 }}>
                          <Typography variant="h6" noWrap sx={{ fontWeight: 900 }}>
                            {d.creditor}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Due {fmtDate(d.dueDate, "PPP")}
                          </Typography>
                        </Stack>

                        <Stack direction="row" spacing={0.5}>
                          <Tooltip title="Edit">
                            <IconButton size="small" onClick={() => openEdit(d)}>
                              <EditRoundedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton size="small" onClick={() => askDelete(d._id)}>
                              <DeleteRoundedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </Stack>

                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2" color="text.secondary">
                          Remaining
                        </Typography>
                        <Typography sx={{ fontWeight: 900 }}>
                          <Money amountUsd={d.remainingAmount} />
                        </Typography>
                      </Stack>

                      <LinearProgress variant="determinate" value={Math.min(100, Math.max(0, pct))} sx={{ height: 10, borderRadius: 999 }} />

                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="caption" color="text.secondary">
                          Paid: <Money amountUsd={paid} /> / <Money amountUsd={d.totalAmount} />
                        </Typography>
                        {isPaidOff ? <Chip size="small" color="success" label="Paid off" /> : <Chip size="small" label={`${pct.toFixed(0)}%`} />}
                      </Stack>

                      <Button
                        variant="contained"
                        startIcon={<PaymentsRoundedIcon />}
                        onClick={() => openPayment(d)}
                        disabled={isPaidOff}
                        sx={{ borderRadius: 3 }}
                      >
                        Pay
                      </Button>

                      <Accordion sx={{ mt: 0.5 }}>
                        <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
                          <Typography sx={{ fontWeight: 800 }}>
                            Payment history ({(d.payments || []).length})
                          </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          {(d.payments || []).length ? (
                            <Stack spacing={1}>
                              {[...d.payments]
                                .sort((a, b) => new Date(b.date) - new Date(a.date))
                                .slice(0, 8)
                                .map((p, idx) => (
                                  <Stack key={idx} direction="row" justifyContent="space-between" alignItems="center">
                                    <Typography variant="body2" color="text.secondary">
                                      {fmtDate(p.date, "PPP")}
                                    </Typography>
                                    <Typography sx={{ fontWeight: 800 }}>
                                      <Money amountUsd={p.amount} />
                                    </Typography>
                                  </Stack>
                                ))}
                            </Stack>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              No payments yet.
                            </Typography>
                          )}
                        </AccordionDetails>
                      </Accordion>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      ) : (
        <Card>
          <CardContent>
            <EmptyState title="No debts yet" actionLabel="Add debt" onAction={openAdd} />
          </CardContent>
        </Card>
      )}

      <DebtDialog
        open={dialogOpen}
        onClose={() => {
          if (busy) return;
          setDialogOpen(false);
          setEditing(null);
        }}
        onSave={saveDebt}
        initial={editing}
      />

      <PaymentDialog
        open={paymentOpen}
        onClose={() => {
          if (busy) return;
          setPaymentOpen(false);
          setPayingDebt(null);
        }}
        onPay={doPay}
        debt={payingDebt}
      />

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => {
          if (busy) return;
          setConfirmOpen(false);
        }}
        title="Delete debt?"
        description="This will remove the debt and its payment history."
        confirmText="Delete"
        onConfirm={doDelete}
        loading={busy}
      />
    </Stack>
  );
}
