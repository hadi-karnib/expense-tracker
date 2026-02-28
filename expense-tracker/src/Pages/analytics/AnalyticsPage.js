import React, { useMemo, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { format, isWithinInterval, startOfMonth, endOfMonth, parseISO } from "date-fns";

import { useExpensesData } from "../../hooks/useExpensesData";
import Money from "../../components/ui/Money";
import EmptyState from "../../components/ui/EmptyState";
import { lastNMonths } from "../../utils/date";

function toDate(v) {
  try {
    return typeof v === "string" ? parseISO(v) : new Date(v);
  } catch {
    return null;
  }
}

export default function AnalyticsPage() {
  const { expenses, loading } = useExpensesData();

  const [monthsBack, setMonthsBack] = useState(12);

  const range = useMemo(() => {
    const end = new Date();
    const startMonth = startOfMonth(lastNMonths(monthsBack, end)[0]);
    return { start: startMonth, end: endOfMonth(end) };
  }, [monthsBack]);

  const inRange = useMemo(() => {
    return expenses.filter((e) => {
      const d = toDate(e.date);
      return d && isWithinInterval(d, range);
    });
  }, [expenses, range]);

  const monthly = useMemo(() => {
    const months = lastNMonths(monthsBack);
    return months.map((m) => {
      const start = startOfMonth(m);
      const end = endOfMonth(m);
      const total = inRange
        .filter((e) => {
          const d = toDate(e.date);
          return d && isWithinInterval(d, { start, end });
        })
        .reduce((acc, e) => acc + Number(e.amount || 0), 0);
      return { month: format(m, "MMM yy"), total };
    });
  }, [inRange, monthsBack]);

  const categories = useMemo(() => {
    const map = new Map();
    for (const e of inRange) {
      const k = (e.category || "Other").trim() || "Other";
      map.set(k, (map.get(k) || 0) + Number(e.amount || 0));
    }
    return Array.from(map.entries())
      .map(([category, total]) => ({ category, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);
  }, [inRange]);

  const weekday = useMemo(() => {
    const names = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const totals = Array(7).fill(0);
    for (const e of inRange) {
      const d = toDate(e.date);
      if (!d) continue;
      totals[d.getDay()] += Number(e.amount || 0);
    }
    return totals.map((t, idx) => ({ day: names[idx], total: t }));
  }, [inRange]);

  const total = useMemo(() => inRange.reduce((a, e) => a + Number(e.amount || 0), 0), [inRange]);

  const avgMonthly = useMemo(() => (monthsBack ? total / monthsBack : 0), [total, monthsBack]);

  return (
    <Stack spacing={2}>
      <Card>
        <CardContent>
          <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} alignItems={{ md: "center" }} justifyContent="space-between">
            <Stack spacing={0.5}>
              <Typography variant="h6">Analytics</Typography>
              <Typography variant="body2" color="text.secondary">
                Patterns over time: months, categories, and weekdays.
              </Typography>
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center">
              <TextField
                size="small"
                label="Range (months)"
                
                value={monthsBack}
                onChange={(e) => setMonthsBack(Math.max(1, Math.min(24, Number(e.target.value || 12))))}
                inputProps={{ min: 1, max: 24 }}
                sx={{ width: 170 }}
              />
            </Stack>
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            <Chip size="small" label={<span>Total: <Money amountUsd={total} /></span>} />
            <Chip size="small" label={<span>Avg/month: <Money amountUsd={avgMonthly} /></span>} />
            <Chip size="small" label={`Months: ${monthsBack}`} />
          </Stack>
        </CardContent>
      </Card>

      {loading ? (
        <Grid container spacing={2}>
          {Array.from({ length: 3 }).map((_, i) => (
            <Grid item xs={12} lg={4} key={i}>
              <Card><CardContent><Box sx={{ height: 320, borderRadius: 3, bgcolor: "rgba(255,255,255,0.05)" }} /></CardContent></Card>
            </Grid>
          ))}
        </Grid>
      ) : !inRange.length ? (
        <Card>
          <CardContent>
            <EmptyState title="No data in this range" description="Try increasing the range, or add more expenses." />
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2}>
          <Grid item xs={12} lg={7}>
            <Card>
              <CardContent>
                <Typography variant="h6">Monthly spending</Typography>
                <Typography variant="body2" color="text.secondary">
                  Last {monthsBack} months
                </Typography>
                <Box sx={{ height: 320, mt: 1 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthly} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
                      <XAxis dataKey="month" tickMargin={8} />
                      <YAxis tickMargin={8} />
                      <Tooltip formatter={(v) => v} />
                      <Bar dataKey="total" fill="#6366F1" radius={[10, 10, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} lg={5}>
            <Card sx={{ height: "100%" }}>
              <CardContent sx={{ height: "100%" }}>
                <Typography variant="h6">Top categories</Typography>
                <Typography variant="body2" color="text.secondary">
                  Highest total spend
                </Typography>
                <Box sx={{ height: 320, mt: 1 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categories} layout="vertical" margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
                      <XAxis  tickMargin={8} />
                      <YAxis type="category" dataKey="category" width={90} />
                      <Tooltip formatter={(v) => v} />
                      <Bar dataKey="total" fill="#22C55E" radius={[0, 10, 10, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6">Weekday pattern</Typography>
                <Typography variant="body2" color="text.secondary">
                  What days you spend the most
                </Typography>
                <Box sx={{ height: 260, mt: 1 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weekday} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
                      <XAxis dataKey="day" tickMargin={8} />
                      <YAxis tickMargin={8} />
                      <Tooltip formatter={(v) => v} />
                      <Bar dataKey="total" fill="#60A5FA" radius={[10, 10, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Stack>
  );
}
