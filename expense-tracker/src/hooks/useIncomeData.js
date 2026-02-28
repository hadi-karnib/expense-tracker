import { useCallback, useEffect, useRef, useState } from "react";
import {
  apiAddIncome,
  apiDeleteIncome,
  apiGetIncome,
  apiUpdateIncome,
} from "../api/income";

export function useIncomeData() {
  const [income, setIncome] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const mounted = useRef(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiGetIncome();
      if (!mounted.current) return;
      setIncome(Array.isArray(data) ? data : []);
    } catch (e) {
      if (!mounted.current) return;
      setError(e?.response?.data?.message || "Failed to load income.");
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

  const addIncome = async (payload) => {
    const res = await apiAddIncome(payload);
    await load();
    return res;
  };

  const updateIncome = async (payload) => {
    const res = await apiUpdateIncome(payload);
    await load();
    return res;
  };

  const deleteIncome = async (id) => {
    const res = await apiDeleteIncome(id);
    await load();
    return res;
  };

  return {
    income,
    loading,
    error,
    reload: load,
    addIncome,
    updateIncome,
    deleteIncome,
  };
}
