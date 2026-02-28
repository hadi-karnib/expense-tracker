import { useCallback, useEffect, useRef, useState } from "react";
import {
  apiAddDebt,
  apiDeleteDebt,
  apiGetDebts,
  apiMakePayment,
  apiUpdateDebt,
} from "../api/debts";

export function useDebtsData() {
  const [debts, setDebts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const mounted = useRef(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiGetDebts();
      if (!mounted.current) return;
      setDebts(Array.isArray(data) ? data : []);
    } catch (e) {
      if (!mounted.current) return;
      setError(e?.response?.data?.message || "Failed to load debts.");
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

  const addDebt = async (payload) => {
    const res = await apiAddDebt(payload);
    await load();
    return res;
  };

  const updateDebt = async (payload) => {
    const res = await apiUpdateDebt(payload);
    await load();
    return res;
  };

  const deleteDebt = async (id) => {
    const res = await apiDeleteDebt(id);
    await load();
    return res;
  };

  const payDebt = async (id, amount) => {
    const res = await apiMakePayment(id, amount);
    await load();
    return res;
  };

  return { debts, loading, error, reload: load, addDebt, updateDebt, deleteDebt, payDebt };
}
