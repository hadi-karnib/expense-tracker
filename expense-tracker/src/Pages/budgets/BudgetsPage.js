import React, { useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  LinearProgress,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import { startOfMonth, endOfMonth, isWithinInterval } from "date-fns";

import { useExpensesData } from "../../hooks/useExpensesData";
import Money from "../../components/ui/Money";
import { getBudgetForMonth, setBudgetForMonth } from "../../utils/budgets";
import { monthKey } from "../../utils/date";

function toDate(d) {
  return d ? new Date(d) : null;
}

export default function BudgetsPage() {
  const { expenses, loading } = useExpensesData();

  const [month, setMonth] = useState(monthKey());
  const [savedAt, setSavedAt] = useState(null);

  const budget = useMemo(() => getBudgetForMonth(month), [month]);

  const [totalUsd, setTotalUsd] = useState(budget.totalUsd || 0);
  const [perCat, setPerCat] = useState(budget.perCategoryUsd || {});

  // refresh local state when month changes
  React.useEffect(() => {
    const b = getBudgetForMonth(month);
    setTotalUsd(b.totalUsd || 0);
    setPerCat(b.perCategoryUsd || {});
  }, [month]);

  const monthRange = useMemo(() => {
    const [y, m] = month.split("-").map(Number);
    const base = new Date(y, m - 1, 1);
    return { start: startOfMonth(base), end: endOfMonth(base) };
  }, [month]);

  const monthExpenses = useMemo(() => {
    return expenses.filter((e) => {
      const d = toDate(e.date);
      return d && isWithinInterval(d, monthRange);
    });
  }, [expenses, monthRange]);

  const spentTotal = useMemo(
    () => monthExpenses.reduce((acc, e) => acc + Number(e.amount || 0), 0),
    [monthExpenses]
  );

  const categories = useMemo(() => {
    const set = new Set();
    monthExpenses.forEach((e) => set.add((e.category || "Other").trim() || "Other"));
    // Include categories already budgeted even if no expense yet
    Object.keys(perCat || {}).forEach((c) => set.add(c));
    return Array.from(set).sort();
  }, [monthExpenses, perCat]);

  const spentByCategory = useMemo(() => {
    const map = new Map();
    for (const e of monthExpenses) {
      const k = (e.category || "Other").trim() || "Other";
      map.set(k, (map.get(k) || 0) + Number(e.amount || 0));
    }
    return map;
  }, [monthExpenses]);

  const save = () => {
    const normalized = {
      totalUsd: Number(totalUsd || 0),
      perCategoryUsd: Object.fromEntries(
        Object.entries(perCat || {}).map(([k, v]) => [k, Number(v || 0)])
      ),
    };
    setBudgetForMonth(month, normalized);
    setSavedAt(new Date());
  };

  const totalPct = totalUsd ? Math.min(100, (spentTotal / totalUsd) * 100) : 0;

  return (
    <Stack spacing={2}>
      <Card>
        <CardContent>
          <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} alignItems={{ md: "center" }} justifyContent="space-between">
            <Stack spacing={0.5}>
              <Typography variant="h6">Budgets</Typography>
              <Typography variant="body2" color="text.secondary">
                Set monthly targets (stored locally), then track progress automatically.
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
              <Button variant="contained" startIcon={<SaveRoundedIcon />} onClick={save}>
                Save
              </Button>
            </Stack>
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Stack spacing={1}>
                <TextField
                  label="Monthly total budget (USD)"
                  
                  value={totalUsd}
                  onChange={(e) => setTotalUsd(e.target.value)}
                  inputProps={{ min: 0, step: "0.01" }}
                  fullWidth
                />
                <Typography variant="caption" color="text.secondary">
                  You can still set category budgets even if total is 0.
                </Typography>
              </Stack>
            </Grid>

            <Grid item xs={12} md={8}>
              <Card variant="outlined" sx={{ height: "100%" }}>
                <CardContent>
                  <Stack spacing={0.75}>
                    <Typography sx={{ fontWeight: 800 }}>This month progress</Typography>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" color="text.secondary">
                        Spent
                      </Typography>
                      <Typography sx={{ fontWeight: 900 }}>
                        <Money amountUsd={spentTotal} />
                      </Typography>
                    </Stack>
                    <LinearProgress variant="determinate" value={totalPct} sx={{ height: 10, borderRadius: 999 }} />
                    <Typography variant="caption" color="text.secondary">
                      {totalUsd ? `${totalPct.toFixed(0)}% of total budget` : "Set a total budget to see %"}
                      {savedAt ? ` • saved ${savedAt.toLocaleTimeString()}` : ""}
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6">Category budgets</Typography>
          <Typography variant="body2" color="text.secondary">
            Track categories you care about (Food, Transport, etc.).
          </Typography>
          <Divider sx={{ my: 2 }} />

          {loading ? (
            <Box sx={{ height: 140, borderRadius: 3, bgcolor: "rgba(255,255,255,0.05)" }} />
          ) : (
            <Grid container spacing={2}>
              {categories.length ? (
                categories.map((c) => {
                  const spent = spentByCategory.get(c) || 0;
                  const limit = Number(perCat?.[c] || 0);
                  const pct = limit ? Math.min(100, (spent / limit) * 100) : 0;

                  return (
                    <Grid item xs={12} md={6} lg={4} key={c}>
                      <Card variant="outlined">
                        <CardContent>
                          <Stack spacing={1}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                              <Typography sx={{ fontWeight: 900 }}>{c}</Typography>
                              <Typography sx={{ fontWeight: 900 }}>
                                <Money amountUsd={spent} />
                              </Typography>
                            </Stack>

                            <TextField
                              label="Budget limit (USD)"
                              
                              value={perCat?.[c] ?? ""}
                              onChange={(e) =>
                                setPerCat((p) => ({ ...(p || {}), [c]: e.target.value }))
                              }
                              inputProps={{ min: 0, step: "0.01" }}
                              fullWidth
                            />

                            <LinearProgress variant="determinate" value={pct} sx={{ height: 8, borderRadius: 999 }} />
                            <Typography variant="caption" color="text.secondary">
                              {limit ? `${pct.toFixed(0)}% used` : "Set a limit to track %"}
                            </Typography>
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })
              ) : (
                <Grid item xs={12}>
                  <Typography color="text.secondary">
                    No categories found for this month yet. Add some expenses first.
                  </Typography>
                </Grid>
              )}
            </Grid>
          )}
        </CardContent>
      </Card>
    </Stack>
  );
}
