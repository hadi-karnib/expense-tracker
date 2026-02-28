import { api } from "./client";

// Expected backend endpoints (cookie-auth):
// GET    /api/income
// POST   /api/income
// PATCH  /api/income
// DELETE /api/income   (body: { id })

export async function apiGetIncome() {
  const { data } = await api.get("/api/income");
  return data;
}

export async function apiAddIncome(payload) {
  const { data } = await api.post("/api/income", payload);
  return data;
}

export async function apiUpdateIncome(payload) {
  const { data } = await api.patch("/api/income", payload);
  return data;
}

export async function apiDeleteIncome(id) {
  const { data } = await api.delete("/api/income", { data: { id } });
  return data;
}


// Salary helpers
export async function apiGetIncomeByMonth(monthKey) {
  const { data } = await api.get("/api/income", { params: { month: monthKey } });
  return data;
}

export async function apiGetSalarySettings() {
  const { data } = await api.get("/api/income/salary/settings");
  return data;
}

export async function apiPatchSalarySettings(payload) {
  const { data } = await api.patch("/api/income/salary/settings", payload);
  return data;
}

export async function apiEditSalaryForMonth({ month, amount, applyToFuture }) {
  const { data } = await api.post("/api/income/salary/edit-month", { month, amount, applyToFuture });
  return data;
}
