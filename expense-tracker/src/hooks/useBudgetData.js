import { useCallback, useEffect, useState } from "react";
import { apiGetBudget, apiUpsertBudget } from "../api/budgets";

export function useBudgetData(monthKey) {
  const [budget, setBudget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    if (!monthKey) return;
    setLoading(true);
    setError("");
    try {
      const data = await apiGetBudget(monthKey);
      setBudget(data || null);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load budget.");
    } finally {
      setLoading(false);
    }
  }, [monthKey]);

  useEffect(() => {
    reload();
  }, [reload]);

  const save = useCallback(async (payload) => {
    const data = await apiUpsertBudget(payload);
    await reload();
    return data;
  }, [reload]);

  return { budget, loading, error, reload, save };
}
