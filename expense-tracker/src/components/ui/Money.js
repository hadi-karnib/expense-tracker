import React from "react";
import { useSettings } from "../../context/SettingsContext";
import { formatMoney } from "../../utils/money";

export default function Money({ amountUsd, variant = "body1", component: Comp = "span" }) {
  const { currency, lbpRate } = useSettings();
  const text = formatMoney(amountUsd, { currency, rate: lbpRate });
  return <Comp style={{ fontVariantNumeric: "tabular-nums" }}>{text}</Comp>;
}
