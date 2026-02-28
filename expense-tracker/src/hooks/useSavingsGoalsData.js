import { useCallback, useEffect, useState } from "react";
import { apiCreateGoal, apiDeleteGoal, apiListGoals, apiUpdateGoal } from "../api/savings";

export function useSavingsGoalsData() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiListGoals();
      setGoals(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load savings goals.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const create = useCallback(async (payload) => {
    const data = await apiCreateGoal(payload);
    await reload();
    return data;
  }, [reload]);

  const update = useCallback(async (payload) => {
    const data = await apiUpdateGoal(payload);
    await reload();
    return data;
  }, [reload]);

  const remove = useCallback(async (id) => {
    const data = await apiDeleteGoal(id);
    await reload();
    return data;
  }, [reload]);

  return { goals, loading, error, reload, create, update, remove };
}
