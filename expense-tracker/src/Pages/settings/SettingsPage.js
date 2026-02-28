import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  IconButton,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";

import { useSettings } from "../../context/SettingsContext";
import { useCategoriesData } from "../../hooks/useCategoriesData";
import { useRulesData } from "../../hooks/useRulesData";
import { useSavingsGoalsData } from "../../hooks/useSavingsGoalsData";
import { apiGetSalarySettings, apiPatchSalarySettings } from "../../api/income";

function Section({ title, subtitle, children, defaultExpanded = false }) {
  return (
    <Accordion defaultExpanded={defaultExpanded} disableGutters sx={{ borderRadius: 3, overflow: "hidden" }}>
      <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
        <Stack>
          <Typography sx={{ fontWeight: 900 }}>{title}</Typography>
          {subtitle ? (
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          ) : null}
        </Stack>
      </AccordionSummary>
      <AccordionDetails>
        <Box sx={{ pt: 0.5 }}>{children}</Box>
      </AccordionDetails>
    </Accordion>
  );
}

export default function SettingsPage() {
  const { mode, toggleMode, currency, setCurrency, lbpRate, setLbpRate } = useSettings();

  const { categories, loading: catLoading, error: catError, upsert: upsertCategory, remove: removeCategory } =
    useCategoriesData();

  const { rules, loading: rulesLoading, error: rulesError, upsert: upsertRule, remove: removeRule } = useRulesData();

  const { goals, loading: goalsLoading, error: goalsError, create: createGoal, update: updateGoal, remove: removeGoal } =
    useSavingsGoalsData();

  // Salary settings
  const [salaryBusy, setSalaryBusy] = useState(false);
  const [salaryError, setSalaryError] = useState("");
  const [salaryOk, setSalaryOk] = useState("");
  const [salarySettings, setSalarySettings] = useState({ enabled: false, defaultSalaryUsd: 0, dayOfMonth: 1 });

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await apiGetSalarySettings();
        if (!mounted) return;
        setSalarySettings({
          enabled: !!data?.salaryEnabled,
          defaultSalaryUsd: Number(data?.defaultSalaryUsd || 0),
          dayOfMonth: Number(data?.salaryDayOfMonth || 1),
        });
      } catch (e) {
        // If not logged in, page will show other auth guard anyway
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const saveSalary = async () => {
    setSalaryBusy(true);
    setSalaryError("");
    setSalaryOk("");
    try {
      await apiPatchSalarySettings({
        salaryEnabled: !!salarySettings.enabled,
        defaultSalaryUsd: Number(salarySettings.defaultSalaryUsd || 0),
        salaryDayOfMonth: Number(salarySettings.dayOfMonth || 1),
      });
      setSalaryOk("Saved.");
      setTimeout(() => setSalaryOk(""), 1800);
    } catch (e) {
      setSalaryError(e?.response?.data?.message || "Failed to save salary settings.");
    } finally {
      setSalaryBusy(false);
    }
  };

  // Categories
  const [newCatName, setNewCatName] = useState("");
  const [newCatColor, setNewCatColor] = useState("#4f46e5");

  // Rules
  const categoryOptions = useMemo(() => (categories || []).map((c) => c.name).filter(Boolean), [categories]);
  const [newRuleKeyword, setNewRuleKeyword] = useState("");
  const [newRuleCategory, setNewRuleCategory] = useState("");
  const [newRuleApplyTo, setNewRuleApplyTo] = useState("expense");

  // Savings
  const [newGoalName, setNewGoalName] = useState("");
  const [newGoalTarget, setNewGoalTarget] = useState("");
  const [newGoalCurrent, setNewGoalCurrent] = useState("");

  return (
    <Stack spacing={2}>
      <Card>
        <CardContent>
          <Typography variant="h6">Preferences</Typography>
          <Typography variant="body2" color="text.secondary">
            Keep it clean: currency display + theme.
          </Typography>
          <Divider sx={{ my: 2 }} />

          <Stack spacing={2}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Stack spacing={0.2}>
                <Typography sx={{ fontWeight: 800 }}>Dark mode</Typography>
                <Typography variant="caption" color="text.secondary">
                  Current: {mode}
                </Typography>
              </Stack>
              <Switch checked={mode === "dark"} onChange={toggleMode} />
            </Stack>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                select
                fullWidth
                label="Display currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              >
                <MenuItem value="USD">USD</MenuItem>
                <MenuItem value="LBP">LBP</MenuItem>
              </TextField>

              <TextField
                fullWidth
                label="LBP rate (per 1 USD)"
                
                value={lbpRate}
                onChange={(e) => setLbpRate(Number(e.target.value || 0))}
              />
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Section title="Salary" subtitle="Recurring monthly income. Edit the current month from the dashboard." defaultExpanded>
        <Stack spacing={2}>
          {salaryError ? <Alert severity="error">{salaryError}</Alert> : null}
          {salaryOk ? <Alert severity="success">{salaryOk}</Alert> : null}

          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack spacing={0.2}>
              <Typography sx={{ fontWeight: 900 }}>Enable salary</Typography>
              <Typography variant="caption" color="text.secondary">
                Auto-creates an income entry with autoKey salary:YYYY-MM.
              </Typography>
            </Stack>
            <Switch
              checked={!!salarySettings.enabled}
              onChange={(e) => setSalarySettings((s) => ({ ...s, enabled: e.target.checked }))}
            />
          </Stack>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              fullWidth
              
              label="Default salary (USD)"
              value={salarySettings.defaultSalaryUsd}
              onChange={(e) => setSalarySettings((s) => ({ ...s, defaultSalaryUsd: Number(e.target.value || 0) }))}
              disabled={!salarySettings.enabled}
            />
            <TextField
              fullWidth
              
              label="Salary day of month"
              value={salarySettings.dayOfMonth}
              onChange={(e) => setSalarySettings((s) => ({ ...s, dayOfMonth: Number(e.target.value || 1) }))}
              inputProps={{ min: 1, max: 31 }}
              disabled={!salarySettings.enabled}
            />
          </Stack>

          <Box>
            <Button
              variant="contained"
              startIcon={<SaveRoundedIcon />}
              onClick={saveSalary}
              disabled={salaryBusy}
            >
              Save salary settings
            </Button>
          </Box>
        </Stack>
      </Section>

      <Section title="Categories" subtitle="Stored in backend with colors (used by charts)">
        <Stack spacing={2}>
          {catError ? <Alert severity="error">{catError}</Alert> : null}

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems={{ sm: "center" }}>
            <TextField
              fullWidth
              label="New category"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
            />
            <TextField
              label="Color"
              type="color"
              value={newCatColor}
              onChange={(e) => setNewCatColor(e.target.value)}
              sx={{ width: { xs: "100%", sm: 160 } }}
            />
            <Button
              variant="contained"
              startIcon={<AddRoundedIcon />}
              onClick={async () => {
                const name = newCatName.trim();
                if (!name) return;
                await upsertCategory({ name, color: newCatColor });
                setNewCatName("");
              }}
              disabled={catLoading}
            >
              Add
            </Button>
          </Stack>

          <Divider />

          <Stack spacing={1}>
            {(categories || []).map((c) => (
              <Stack
                key={c._id || c.name}
                direction={{ xs: "column", sm: "row" }}
                spacing={1.5}
                alignItems={{ sm: "center" }}
              >
                <TextField fullWidth label="Name" value={c.name} disabled />
                <TextField
                  label="Color"
                  type="color"
                  value={c.color || "#4f46e5"}
                  onChange={async (e) => {
                    await upsertCategory({ name: c.name, color: e.target.value });
                  }}
                  sx={{ width: { xs: "100%", sm: 160 } }}
                />
                <IconButton onClick={() => removeCategory(c.name)} aria-label="Delete category">
                  <DeleteRoundedIcon />
                </IconButton>
              </Stack>
            ))}
            {!catLoading && (categories || []).length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No categories yet.
              </Typography>
            ) : null}
          </Stack>
        </Stack>
      </Section>

      <Section title="Smart rules" subtitle="Keyword → category (used by CSV import and quick categorization)">
        <Stack spacing={2}>
          {rulesError ? <Alert severity="error">{rulesError}</Alert> : null}

          <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} alignItems={{ md: "center" }}>
            <TextField
              fullWidth
              label="Keyword"
              placeholder="ex: netflix"
              value={newRuleKeyword}
              onChange={(e) => setNewRuleKeyword(e.target.value)}
            />
            <TextField
              select
              fullWidth
              label="Category"
              value={newRuleCategory}
              onChange={(e) => setNewRuleCategory(e.target.value)}
            >
              {categoryOptions.map((n) => (
                <MenuItem key={n} value={n}>
                  {n}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Applies to"
              value={newRuleApplyTo}
              onChange={(e) => setNewRuleApplyTo(e.target.value)}
              sx={{ width: { xs: "100%", md: 180 } }}
            >
              <MenuItem value="expense">Expenses</MenuItem>
              <MenuItem value="income">Income</MenuItem>
              <MenuItem value="both">Both</MenuItem>
            </TextField>
            <Button
              variant="contained"
              startIcon={<AddRoundedIcon />}
              onClick={async () => {
                const keyword = newRuleKeyword.trim();
                if (!keyword || !newRuleCategory) return;
                await upsertRule({ keyword, category: newRuleCategory, applyTo: newRuleApplyTo });
                setNewRuleKeyword("");
              }}
              disabled={rulesLoading}
            >
              Add
            </Button>
          </Stack>

          <Divider />

          <Stack spacing={1}>
            {(rules || []).map((r) => (
              <Stack
                key={r._id}
                direction={{ xs: "column", md: "row" }}
                spacing={1.5}
                alignItems={{ md: "center" }}
              >
                <TextField fullWidth label="Keyword" value={r.keyword || ""} disabled />
                <TextField fullWidth label="Category" value={r.category || ""} disabled />
                <TextField
                  label="Applies to"
                  value={r.applyTo || "expense"}
                  disabled
                  sx={{ width: { xs: "100%", md: 180 } }}
                />
                <IconButton onClick={() => removeRule(r._id)} aria-label="Delete rule">
                  <DeleteRoundedIcon />
                </IconButton>
              </Stack>
            ))}
            {!rulesLoading && (rules || []).length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No rules yet.
              </Typography>
            ) : null}
          </Stack>
        </Stack>
      </Section>

      <Section title="Savings goals" subtitle="Track goals and progress (stored in backend)">
        <Stack spacing={2}>
          {goalsError ? <Alert severity="error">{goalsError}</Alert> : null}

          <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} alignItems={{ md: "center" }}>
            <TextField fullWidth label="Goal name" value={newGoalName} onChange={(e) => setNewGoalName(e.target.value)} />
            <TextField
              fullWidth
              
              label="Target (USD)"
              value={newGoalTarget}
              onChange={(e) => setNewGoalTarget(e.target.value)}
            />
            <TextField
              fullWidth
              
              label="Current (USD)"
              value={newGoalCurrent}
              onChange={(e) => setNewGoalCurrent(e.target.value)}
            />
            <Button
              variant="contained"
              startIcon={<AddRoundedIcon />}
              onClick={async () => {
                const name = newGoalName.trim();
                const targetUsd = Number(newGoalTarget || 0);
                const currentUsd = Number(newGoalCurrent || 0);
                if (!name || targetUsd <= 0) return;
                await createGoal({ name, targetUsd, currentUsd });
                setNewGoalName("");
                setNewGoalTarget("");
                setNewGoalCurrent("");
              }}
              disabled={goalsLoading}
            >
              Add
            </Button>
          </Stack>

          <Divider />

          <Stack spacing={1}>
            {(goals || []).map((g) => (
              <GoalRow key={g._id} goal={g} onUpdate={updateGoal} onDelete={removeGoal} />
            ))}
            {!goalsLoading && (goals || []).length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No goals yet.
              </Typography>
            ) : null}
          </Stack>
        </Stack>
      </Section>
    </Stack>
  );
}

function GoalRow({ goal, onUpdate, onDelete }) {
  const [current, setCurrent] = useState(goal.currentUsd ?? 0);
  const [busy, setBusy] = useState(false);

  const save = async () => {
    setBusy(true);
    try {
      await onUpdate({ id: goal._id, currentUsd: Number(current || 0) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card variant="outlined" sx={{ borderRadius: 3 }}>
      <CardContent>
        <Stack spacing={1.5}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} alignItems={{ md: "center" }}>
            <Typography sx={{ fontWeight: 900, flex: 1 }}>{goal.name}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ minWidth: 180 }}>
              Target: ${Number(goal.targetUsd || 0).toLocaleString()}
            </Typography>
          </Stack>

          <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} alignItems={{ md: "center" }}>
            <TextField
              fullWidth
              
              label="Current (USD)"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
            />
            <Button variant="contained" startIcon={<SaveRoundedIcon />} onClick={save} disabled={busy}>
              Save
            </Button>
            <Button variant="text" color="error" onClick={() => onDelete(goal._id)} startIcon={<DeleteRoundedIcon />}>
              Delete
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
