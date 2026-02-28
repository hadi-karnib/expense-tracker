import { api } from "./client";

export async function apiListGoals() {
  const { data } = await api.get("/api/savings");
  return data;
}

export async function apiCreateGoal(payload) {
  const { data } = await api.post("/api/savings", payload);
  return data;
}

export async function apiUpdateGoal(payload) {
  const { data } = await api.patch("/api/savings", payload);
  return data;
}

export async function apiDeleteGoal(id) {
  const { data } = await api.delete("/api/savings", { data: { id } });
  return data;
}
