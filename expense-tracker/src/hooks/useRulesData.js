import { useCallback, useEffect, useState } from "react";
import { apiDeleteRule, apiGetRules, apiUpsertRule } from "../api/rules";

export function useRulesData() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiGetRules();
      setRules(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load rules.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const upsert = useCallback(async ({ keyword, category, applyTo }) => {
    const data = await apiUpsertRule({ keyword, category, applyTo });
    await reload();
    return data;
  }, [reload]);

  const remove = useCallback(async (id) => {
    const data = await apiDeleteRule(id);
    await reload();
    return data;
  }, [reload]);

  return { rules, loading, error, reload, upsert, remove };
}
