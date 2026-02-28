export function formatMoney(amount, { currency, rate, locale = "en-US" }) {
  const safe = Number(amount || 0);
  const value = currency === "LBP" ? safe * (rate || 1) : safe;

  // Keep LBP without decimals, USD with 2
  const opts =
    currency === "LBP"
      ? { style: "currency", currency: "LBP", maximumFractionDigits: 0 }
      : { style: "currency", currency: "USD", maximumFractionDigits: 2 };

  try {
    return new Intl.NumberFormat(locale, opts).format(value);
  } catch {
    // Fallback if currency is unsupported
    const rounded = currency === "LBP" ? Math.round(value) : Math.round(value * 100) / 100;
    return `${rounded} ${currency}`;
  }
}

export function toUsd(amount, { currency, rate }) {
  const safe = Number(amount || 0);
  if (currency === "LBP") {
    const r = Number(rate || 1);
    return r ? safe / r : safe;
  }
  return safe;
}

export function fromUsd(amount, { currency, rate }) {
  const safe = Number(amount || 0);
  if (currency === "LBP") {
    return safe * Number(rate || 1);
  }
  return safe;
}
