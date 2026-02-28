import { useCallback, useEffect, useMemo, useState } from "react";
import { apiDeleteCategory, apiGetCategories, apiUpsertCategory } from "../api/categories";

export function useCategoriesData() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiGetCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load categories.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const upsert = useCallback(async ({ name, color }) => {
    const data = await apiUpsertCategory({ name, color });
    // backend returns updated list or single; safest reload
    await reload();
    return data;
  }, [reload]);

  const remove = useCallback(async (name) => {
    const data = await apiDeleteCategory(name);
    await reload();
    return data;
  }, [reload]);

  const colorMap = useMemo(() => {
    const m = new Map();
    (categories || []).forEach((c) => {
      if (c?.name) m.set(String(c.name), c.color || "");
    });
    return m;
  }, [categories]);

  return { categories, colorMap, loading, error, reload, upsert, remove };
}
