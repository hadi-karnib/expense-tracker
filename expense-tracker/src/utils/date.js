import { format, isValid, parseISO, startOfMonth, subMonths } from "date-fns";

export function toDate(value) {
  if (!value) return null;
  const d = typeof value === "string" ? parseISO(value) : new Date(value);
  return isValid(d) ? d : null;
}

export function fmtDate(value, pattern = "yyyy-MM-dd") {
  const d = toDate(value);
  return d ? format(d, pattern) : "";
}

export function monthKey(date = new Date()) {
  const d = startOfMonth(date);
  return format(d, "yyyy-MM");
}

export function lastNMonths(n = 6, from = new Date()) {
  return Array.from({ length: n }).map((_, i) => subMonths(from, n - 1 - i));
}
