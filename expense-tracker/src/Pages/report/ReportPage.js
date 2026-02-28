import React, { useMemo, useState } from "react";
import {
  Alert,
  Button,
  Card,
  CardContent,
  Divider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import PictureAsPdfRoundedIcon from "@mui/icons-material/PictureAsPdfRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import { startOfMonth, endOfMonth, isWithinInterval, format } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { useExpensesData } from "../../hooks/useExpensesData";
import { useDebtsData } from "../../hooks/useDebtsData";
import { monthKey } from "../../utils/date";
import { useSettings } from "../../context/SettingsContext";
import { formatMoney, fromUsd } from "../../utils/money";
import { downloadCsv } from "../../utils/csv";

function toDate(v) {
  return v ? new Date(v) : null;
}

export default function ReportPage() {
  const { expenses, loading: loadingExpenses } = useExpensesData();
  const { debts, loading: loadingDebts } = useDebtsData();
  const { currency, lbpRate } = useSettings();

  const loading = loadingExpenses || loadingDebts;

  const [month, setMonth] = useState(monthKey());
  const [error, setError] = useState("");

  const monthRange = useMemo(() => {
    const [y, m] = month.split("-").map(Number);
    const base = new Date(y, m - 1, 1);
    return { start: startOfMonth(base), end: endOfMonth(base), label: format(base, "MMMM yyyy") };
  }, [month]);

  const monthExpenses = useMemo(() => {
    return expenses
      .filter((e) => {
        const d = toDate(e.date);
        return d && isWithinInterval(d, monthRange);
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [expenses, monthRange]);

  const monthTotalUsd = useMemo(
    () => monthExpenses.reduce((acc, e) => acc + Number(e.amount || 0), 0),
    [monthExpenses]
  );

  const topCategory = useMemo(() => {
    const map = new Map();
    for (const e of monthExpenses) {
      const k = (e.category || "Other").trim() || "Other";
      map.set(k, (map.get(k) || 0) + Number(e.amount || 0));
    }
    let best = null;
    for (const [k, v] of map.entries()) {
      if (!best || v > best.amount) best = { category: k, amount: v };
    }
    return best;
  }, [monthExpenses]);

  const debtRemainingUsd = useMemo(
    () => debts.reduce((acc, d) => acc + Number(d.remainingAmount || 0), 0),
    [debts]
  );

  const money = (usd) => formatMoney(usd, { currency, rate: lbpRate });

  const exportCsv = () => {
    const rows = monthExpenses.map((e) => ({
      date: new Date(e.date).toISOString().slice(0, 10),
      category: e.category,
      description: e.description || "",
      amount_usd: e.amount,
    }));
    downloadCsv(`report-expenses-${month}.csv`, rows);
  };

  const downloadPdf = () => {
    try {
      setError("");
      const doc = new jsPDF({ unit: "pt", format: "a4" });

      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text(`Expense Report — ${monthRange.label}`, 40, 48);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.text(`Currency view: ${currency}${currency === "LBP" ? ` (rate: ${lbpRate})` : ""}`, 40, 70);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 40, 86);

      doc.setDrawColor(220);
      doc.line(40, 98, 555, 98);

      const summary = [
        ["Expenses count", String(monthExpenses.length)],
        ["Total spent", money(monthTotalUsd)],
        ["Top category", topCategory ? `${topCategory.category} (${money(topCategory.amount)})` : "—"],
        ["Debt remaining (all)", money(debtRemainingUsd)],
      ];

      autoTable(doc, {
        startY: 112,
        head: [["Summary", ""]],
        body: summary,
        theme: "striped",
        styles: { fontSize: 10, cellPadding: 6 },
        headStyles: { fillColor: [99, 102, 241] },
        columnStyles: { 0: { cellWidth: 180 }, 1: { cellWidth: 335 } },
      });

      const expensesRows = monthExpenses.map((e) => {
        const usd = Number(e.amount || 0);
        const displayAmount = currency === "LBP" ? fromUsd(usd, { currency: "LBP", rate: lbpRate }) : usd;
        const amountText =
          currency === "LBP"
            ? `${Math.round(displayAmount).toLocaleString()} LBP`
            : `${usd.toFixed(2)} USD`;

        return [
          new Date(e.date).toISOString().slice(0, 10),
          e.category || "Other",
          e.description || "",
          amountText,
        ];
      });

      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 16,
        head: [["Date", "Category", "Description", `Amount (${currency})`]],
        body: expensesRows.length ? expensesRows : [["—", "—", "No expenses for this month", "—"]],
        theme: "grid",
        styles: { fontSize: 9, cellPadding: 5 },
        headStyles: { fillColor: [34, 197, 94] },
        columnStyles: { 0: { cellWidth: 70 }, 1: { cellWidth: 120 }, 2: { cellWidth: 255 }, 3: { cellWidth: 90 } },
      });

      const debtsRows = debts.map((d) => [
        d.creditor || "—",
        `${Number(d.totalAmount || 0).toFixed(2)} USD`,
        `${Number(d.remainingAmount || 0).toFixed(2)} USD`,
        d.dueDate ? new Date(d.dueDate).toISOString().slice(0, 10) : "—",
        String((d.payments || []).length),
      ]);

      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 16,
        head: [["Creditor", "Total (USD)", "Remaining (USD)", "Due", "Payments"]],
        body: debtsRows.length ? debtsRows : [["—", "—", "—", "—", "0"]],
        theme: "grid",
        styles: { fontSize: 9, cellPadding: 5 },
        headStyles: { fillColor: [96, 165, 250] },
      });

      doc.setFontSize(9);
      doc.setTextColor(120);
      doc.text("Generated by Expense Tracker", 40, 820);

      doc.save(`expense-report-${month}.pdf`);
    } catch (e) {
      setError("Could not generate PDF. Please try again.");
    }
  };

  return (
    <Stack spacing={2}>
      <Card>
        <CardContent>
          <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} alignItems={{ md: "center" }} justifyContent="space-between">
            <Stack spacing={0.5}>
              <Typography variant="h6">Report</Typography>
              <Typography variant="body2" color="text.secondary">
                Generate a clean PDF report for a selected month.
              </Typography>
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center">
              <TextField
                size="small"
                label="Month"
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
              <Button
                variant="outlined"
                startIcon={<DownloadRoundedIcon />}
                onClick={exportCsv}
                disabled={loading || !monthExpenses.length}
              >
                CSV
              </Button>
              <Button
                variant="contained"
                startIcon={<PictureAsPdfRoundedIcon />}
                onClick={downloadPdf}
                disabled={loading}
              >
                PDF
              </Button>
            </Stack>
          </Stack>

          <Divider sx={{ my: 2 }} />

          {error ? <Alert severity="error">{error}</Alert> : null}

          <Stack spacing={0.75}>
            <Typography sx={{ fontWeight: 800 }}>{monthRange.label}</Typography>
            <Typography variant="body2" color="text.secondary">
              Expenses: <b>{monthExpenses.length}</b> • Total: <b>{money(monthTotalUsd)}</b> • Debt remaining: <b>{money(debtRemainingUsd)}</b>
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}
