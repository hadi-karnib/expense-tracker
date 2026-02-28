import { monthKey } from "./date";

const KEY = "expense-tracker:budgets:v1";

export function getBudgets() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function getBudgetForMonth(key = monthKey()) {
  const all = getBudgets();
  return all[key] || { totalUsd: 0, perCategoryUsd: {} };
}

export function setBudgetForMonth(key, budget) {
  const all = getBudgets();
  all[key] = budget;
  localStorage.setItem(KEY, JSON.stringify(all));
}
