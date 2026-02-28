import { api } from "./client";

export async function apiGetDebts() {
  const { data } = await api.get("/api/debt");
  return data;
}

export async function apiAddDebt(payload) {
  const { data } = await api.post("/api/debt", payload);
  return data;
}

export async function apiUpdateDebt(payload) {
  const { data } = await api.patch("/api/debt", payload);
  return data;
}

export async function apiDeleteDebt(id) {
  const { data } = await api.delete("/api/debt", { data: { id } });
  return data;
}

export async function apiMakePayment(id, amount) {
  const { data } = await api.post("/api/debt/pay", { id, amount });
  return data;
}
