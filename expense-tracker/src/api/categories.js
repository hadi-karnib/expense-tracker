import { api } from "./client";

export async function apiGetCategories() {
  const { data } = await api.get("/api/categories");
  return data;
}

export async function apiUpsertCategory({ name, color }) {
  const { data } = await api.post("/api/categories", { name, color });
  return data;
}

export async function apiDeleteCategory(name) {
  const { data } = await api.delete("/api/categories", { data: { name } });
  return data;
}
