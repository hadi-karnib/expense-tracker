import React, { useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Switch,
  FormControlLabel,
  CardContent,
  Chip,
  Divider,
  Grid,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import PaidRoundedIcon from "@mui/icons-material/PaidRounded";
import CategoryRoundedIcon from "@mui/icons-material/CategoryRounded";
import CreditScoreRoundedIcon from "@mui/icons-material/CreditScoreRounded";
import TimerRoundedIcon from "@mui/icons-material/TimerRounded";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from "recharts";
import {
  format,
  isWithinInterval,
  startOfMonth,
  subMonths,
  endOfMonth,
  addDays,
} from "date-fns";

import StatCard from "../../components/ui/StatCard";
import Money from "../../components/ui/Money";
import EmptyState from "../../components/ui/EmptyState";
import { useExpensesData } from "../../hooks/useExpensesData";
import { useDebtsData } from "../../hooks/useDebtsData";
import { useIncomeMonthData } from "../../hooks/useIncomeMonthData";
import { apiEditSalaryForMonth } from "../../api/income";
import { getCategoryColor } from "../../utils/categoryColors";

function toDate(d) {
  return d ? new Date(d) : null;
}

function sum(items) {
  return items.reduce((acc, x) => acc + Number(x.amount || 0), 0);
}

export default function DashboardPage() {
  const { expenses, loading: loadingExpenses } = useExpensesData();
  const { debts, loading: loadingDebts } = useDebtsData();
  const now = new Date();
  const monthKey = format(now, "yyyy-MM");
  const { income: monthIncome, loading: loadingIncome, reload: reloadIncome } = useIncomeMonthData(monthKey);

  const [salaryOpen, setSalaryOpen] = useState(false);
  const [salaryAmount, setSalaryAmount] = useState(0);
  const [salaryApplyToFuture, setSalaryApplyToFuture] = useState(true);
  const [salaryBusy, setSalaryBusy] = useState(false);
  const [salaryErr, setSalaryErr] = useState("");



  const loading = loadingExpenses || loadingDebts || loadingIncome;

  const now = new Date();
  const thisMonthStart = startOfMonth(now);
  const thisMonthEnd = endOfMonth(now);
  const prevMonthStart = startOfMonth(subMonths(now, 1));
  const prevMonthEnd = endOfMonth(subMonths(now, 1));

  const monthExpenses = useMemo(() => {
    return expenses.filter((e) => {
      const d = toDate(e.date);
      return (
        d && isWithinInterval(d, { start: thisMonthStart, end: thisMonthEnd })
      );
    });
  }, [expenses, thisMonthStart, thisMonthEnd]);

  const prevMonthExpenses = useMemo(() => {
    return expenses.filter((e) => {
      const d = toDate(e.date);
      return (
        d && isWithinInterval(d, { start: prevMonthStart, end: prevMonthEnd })
      );
    });
  }, [expenses, prevMonthStart, prevMonthEnd]);

  const thisMonthTotal = useMemo(() => sum(monthExpenses), [monthExpenses]);

    const thisMonthIncomeTotal = useMemo(() => sum(monthIncome), [monthIncome]);
  const thisMonthNet = useMemo(
    () => thisMonthIncomeTotal - thisMonthTotal,
    [thisMonthIncomeTotal, thisMonthTotal],
  );

  const thisMonthSalary = useMemo(() => {
    return monthIncome
      .filter((i) => String(i.source || "").toLowerCase() === "salary")
      .reduce((acc, i) => acc + Number(i.amount || 0), 0);
  }, [monthIncome]);
  const prevMonthTotal = useMemo(
    () => sum(prevMonthExpenses),
    [prevMonthExpenses],
  );

  const pctChange = useMemo(() => {
    if (prevMonthTotal <= 0) return null;
    return ((thisMonthTotal - prevMonthTotal) / prevMonthTotal) * 100;
  }, [thisMonthTotal, prevMonthTotal]);

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

  const debtRemainingTotal = useMemo(
    () => debts.reduce((acc, d) => acc + Number(d.remainingAmount || 0), 0),
    [debts],
  );

  const dueSoon = useMemo(() => {
    const limit = addDays(now, 14);
    return debts
      .filter((d) => d?.remainingAmount > 0)
      .filter((d) => {
        const dd = toDate(d.dueDate);
        return dd && dd <= limit;
      })
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 4);
  }, [debts, now]);

  const trend = useMemo(() => {
    const months = Array.from({ length: 6 }).map((_, i) =>
      subMonths(now, 5 - i),
    );
    return months.map((m) => {
      const start = startOfMonth(m);
      const end = endOfMonth(m);
      const total = expenses
        .filter((e) => {
          const d = toDate(e.date);
          return d && isWithinInterval(d, { start, end });
        })
        .reduce((acc, e) => acc + Number(e.amount || 0), 0);
      return { month: format(m, "MMM yy"), total };
    });
  }, [expenses, now]);

  const categoryData = useMemo(() => {
    const map = new Map();
    for (const e of monthExpenses) {
      const k = (e.category || "Other").trim() || "Other";
      map.set(k, (map.get(k) || 0) + Number(e.amount || 0));
    }
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [monthExpenses]);

  const recent = useMemo(() => {
    return [...expenses]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 7);
  }, [expenses]);

  return (
    <Stack spacing={3}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6} lg={3}>
          <StatCard
            label="Spent this month"
            value={
              loading ? (
                <Skeleton width={140} />
              ) : (
                <Money amountUsd={thisMonthTotal} />
              )
            }
            hint={
              loading
                ? " "
                : pctChange === null
                  ? "No previous month data"
                  : `${pctChange >= 0 ? "+" : ""}${pctChange.toFixed(1)}% vs last month`
            }
            icon={<TrendingUpRoundedIcon />}
          />
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <StatCard
            label="Income this month"
            value={
              loading ? (
                <Skeleton width={140} />
              ) : (
                <Money amountUsd={thisMonthIncomeTotal} />
              )
            }
            hint={
              loading
                ? " "
                : thisMonthSalary > 0
                  ? `Salary: ${new Intl.NumberFormat(undefined, {
                      style: "currency",
                      currency: "USD",
                      maximumFractionDigits: 0,
                    }).format(thisMonthSalary)}`
                  : "Add your salary in Income"
            }
            icon={<PaidRoundedIcon />}
          />
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <StatCard
            label="Net this month"
            value={
              loading ? (
                <Skeleton width={140} />
              ) : (
                <Money amountUsd={thisMonthNet} />
              )
            }
            hint="Income − Expenses"
            icon={<TrendingUpRoundedIcon />}
          />
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <StatCard
            label="Top category"
            value={
              loading ? (
                <Skeleton width={160} />
              ) : topCategory ? (
                <span>
                  {topCategory.category} •{" "}
                  <Money amountUsd={topCategory.amount} />
                </span>
              ) : (
                "—"
              )
            }
            hint="This month"
            icon={<CategoryRoundedIcon />}
          />
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <StatCard
            label="Debt remaining"
            value={
              loading ? (
                <Skeleton width={140} />
              ) : (
                <Money amountUsd={debtRemainingTotal} />
              )
            }
            hint="Across all debts"
            icon={<CreditScoreRoundedIcon />}
          />
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <StatCard
            label="Due soon"
            value={
              loading ? <Skeleton width={90} /> : `${dueSoon.length} debts`
            }
            hint="Next 14 days"
            icon={<TimerRoundedIcon />}
          />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} lg={7}>
          <Card>
            <CardContent>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ mb: 1 }}
              >
                <Typography variant="h6">Spending trend</Typography>
                <Chip size="small" label="Last 6 months" />
              </Stack>
              <Box sx={{ height: 320 }}>
                {loading ? (
                  <Skeleton variant="rounded" height={320} />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={trend}
                      margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient
                          id="colorTotal"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#6366F1"
                            stopOpacity={0.35}
                          />
                          <stop
                            offset="95%"
                            stopColor="#6366F1"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
                      <XAxis dataKey="month" tickMargin={8} />
                      <YAxis tickMargin={8} />
                      <Tooltip formatter={(v) => v} />
                      <Area
                        type="monotone"
                        dataKey="total"
                        stroke="#6366F1"
                        fillOpacity={1}
                        fill="url(#colorTotal)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={5}>
          <Card sx={{ height: "100%" }}>
            <CardContent sx={{ height: "100%" }}>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ mb: 1 }}
              >
                <Typography variant="h6">Category split</Typography>
                <Chip size="small" label="This month" />
              </Stack>

              <Box sx={{ height: 320 }}>
                {loading ? (
                  <Skeleton variant="rounded" height={320} />
                ) : categoryData.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Tooltip formatter={(v) => v} />
                      <Pie
                        data={categoryData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={70}
                        outerRadius={110}
                        paddingAngle={3}
                      >
                        {categoryData.map((d) => (
                          <Cell key={d.name} fill={getCategoryColor(d.name)} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyState
                    title="No expenses this month"
                    description="Add some expenses to see category insights."
                  />
                )}
              
      <Dialog open={salaryOpen} onClose={() => (salaryBusy ? null : setSalaryOpen(false))} fullWidth maxWidth="xs">
        <DialogTitle>Edit salary ({monthKey})</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {salaryErr ? <Typography color="error" variant="body2">{salaryErr}</Typography> : null}
            <TextField
              label="Salary amount (USD)"
              
              value={salaryAmount}
              onChange={(e) => setSalaryAmount(Number(e.target.value || 0))}
              fullWidth
            />
            <FormControlLabel
              control={
                <Switch checked={salaryApplyToFuture} onChange={(e) => setSalaryApplyToFuture(e.target.checked)} />
              }
              label="Apply as default for future months (Option B)"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSalaryOpen(false)} disabled={salaryBusy}>Cancel</Button>
          <Button
            variant="contained"
            disabled={salaryBusy}
            onClick={async () => {
              setSalaryBusy(true);
              setSalaryErr("");
              try {
                await apiEditSalaryForMonth({ month: monthKey, amount: Number(salaryAmount || 0), applyToFuture: salaryApplyToFuture });
                setSalaryOpen(false);
                // refresh month income so salary updates
                reloadIncome();
              } catch (e) {
                setSalaryErr(e?.response?.data?.message || "Failed to update salary.");
              } finally {
                setSalaryBusy(false);
              }
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
</Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card>
        <CardContent>
          <Typography variant="h6">Recent activity</Typography>
          <Typography variant="body2" color="text.secondary">
            Latest expenses and due debts.
          </Typography>
          <Divider sx={{ my: 2 }} />

          {loading ? (
            <Stack spacing={1}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} height={38} />
              ))}
            </Stack>
          ) : recent.length ? (
            <Stack spacing={1.25}>
              {recent.map((e) => (
                <Stack
                  key={e._id}
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Stack>
                    <Typography sx={{ fontWeight: 700 }}>
                      {e.category || "Expense"}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {format(new Date(e.date), "PPP")}
                      {e.description ? ` • ${e.description}` : ""}
                    </Typography>
                  </Stack>
                  <Typography sx={{ fontWeight: 800 }}>
                    <Money amountUsd={e.amount} />
                  </Typography>
                </Stack>
              ))}
            </Stack>
          ) : (
            <EmptyState
              title="No activity yet"
              actionLabel="Add expense"
              onAction={() => window.location.assign("/expenses")}
            />
          )}
        </CardContent>
      </Card>
    </Stack>
  );
}