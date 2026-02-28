import { api } from "./client";

export async function apiGetRules() {
  const { data } = await api.get("/api/rules");
  return data;
}

export async function apiUpsertRule({ keyword, category, applyTo = "expense" }) {
  const { data } = await api.post("/api/rules", { keyword, category, applyTo });
  return data;
}

export async function apiDeleteRule(id) {
  const { data } = await api.delete("/api/rules", { data: { id } });
  return data;
}
