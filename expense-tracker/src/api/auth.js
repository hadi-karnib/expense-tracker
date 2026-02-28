import { api } from "./client";

export async function apiRegister(payload) {
  const { data } = await api.post("/api/auth/register", payload);
  return data;
}

export async function apiLogin(payload) {
  const { data } = await api.post("/api/auth/login", payload);
  return data;
}

export async function apiLogout() {
  const { data } = await api.post("/api/auth/logout");
  return data;
}

export async function apiMe() {
  const { data } = await api.get("/api/auth/me");
  return data;
}
