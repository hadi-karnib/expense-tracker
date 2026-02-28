import { api } from "./client";

export async function apiGetExpenses() {
  const { data } = await api.get("/api/expense");
  return data;
}

export async function apiGetExpensesByMonth(month, year) {
  const { data } = await api.get("/api/expense/month", {
    params: { month, year },
  });
  return data;
}

export async function apiAddExpense(payload) {
  const { data } = await api.post("/api/expense", payload);
  return data;
}

export async function apiUpdateExpense(payload) {
  const { data } = await api.patch("/api/expense", payload);
  return data;
}

export async function apiDeleteExpense(id) {
  const { data } = await api.delete("/api/expense", { data: { id } });
  return data;
}
