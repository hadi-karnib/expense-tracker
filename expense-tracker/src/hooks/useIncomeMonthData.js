import { useCallback, useEffect, useRef, useState } from "react";
import { apiGetIncomeByMonth } from "../api/income";

export function useIncomeMonthData(monthKey) {
  const [income, setIncome] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const mounted = useRef(true);

  const load = useCallback(async () => {
    if (!monthKey) return;
    setLoading(true);
    setError("");
    try {
      const data = await apiGetIncomeByMonth(monthKey);
      if (!mounted.current) return;
      setIncome(Array.isArray(data) ? data : []);
    } catch (e) {
      if (!mounted.current) return;
      setError(e?.response?.data?.message || "Failed to load income.");
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, [monthKey]);

  useEffect(() => {
    mounted.current = true;
    load();
    return () => {
      mounted.current = false;
    };
  }, [load]);

  return { income, loading, error, reload: load };
}
