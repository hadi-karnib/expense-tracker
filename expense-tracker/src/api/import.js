import { api } from "./client";

export async function apiImportCsv({ type, csvText }) {
  const { data } = await api.post("/api/import/csv", { type, csvText });
  return data;
}
