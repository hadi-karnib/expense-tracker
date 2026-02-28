import { useCallback, useEffect, useRef, useState } from "react";
import {
  apiAddExpense,
  apiDeleteExpense,
  apiGetExpenses,
  apiUpdateExpense,
} from "../api/expenses";

export function useExpensesData() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const mounted = useRef(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiGetExpenses();
      if (!mounted.current) return;
      setExpenses(Array.isArray(data) ? data : []);
    } catch (e) {
      if (!mounted.current) return;
      setError(e?.response?.data?.message || "Failed to load expenses.");
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    load();
    return () => {
      mounted.current = false;
    };
  }, [load]);

  const addExpense = async (payload) => {
    const res = await apiAddExpense(payload);
    await load();
    return res;
  };

  const updateExpense = async (payload) => {
    const res = await apiUpdateExpense(payload);
    await load();
    return res;
  };

  const deleteExpense = async (id) => {
    const res = await apiDeleteExpense(id);
    await load();
    return res;
  };

  return { expenses, loading, error, reload: load, addExpense, updateExpense, deleteExpense };
}
