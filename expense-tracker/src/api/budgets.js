import { api } from "./client";

export async function apiGetBudget(monthKey) {
  const { data } = await api.get("/api/budgets", { params: { month: monthKey } });
  return data;
}

export async function apiUpsertBudget(payload) {
  const { data } = await api.post("/api/budgets", payload);
  return data;
}
