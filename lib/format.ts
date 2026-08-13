import type { ResultValue } from "./types";

/** Format a number as currency using the given ISO currency code. */
export function formatCurrency(value: number, currency = "USD", locale = "en-US"): string {
  if (!Number.isFinite(value)) return "-";
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `$${value.toFixed(2)}`;
  }
}

/** Format a number with thousands separators (no currency symbol). */
export function formatNumber(value: number, maxFractionDigits = 2, locale = "en-US"): string {
  if (!Number.isFinite(value)) return "-";
  return new Intl.NumberFormat(locale, {
    maximumFractionDigits: maxFractionDigits,
  }).format(value);
}

export function formatPercentage(value: number, fractionDigits = 2): string {
  if (!Number.isFinite(value)) return "-";
  return `${formatNumber(value, fractionDigits)}%`;
}

export function formatResultValue(r: ResultValue, currency = "USD", locale = "en-US"): string {
  const numeric = typeof r.value === "number" ? r.value : Number(r.value);
  switch (r.format) {
    case "currency":
      return formatCurrency(numeric, currency, locale);
    case "percentage":
      return formatPercentage(numeric);
    case "number":
      return `${formatNumber(numeric)}${r.unit ? ` ${r.unit}` : ""}`;
    case "years":
      return `${formatNumber(numeric, 1)} ${Math.abs(numeric - 1) < 0.05 ? "year" : "years"}`;
    case "text":
    default:
      return String(r.value);
  }
}

/** Strip everything except digits, one leading minus, and one decimal point. */
export function sanitizeNumericInput(raw: string): string {
  let s = raw.replace(/[^0-9.\-]/g, "");
  const neg = s.startsWith("-");
  s = s.replace(/-/g, "");
  const firstDot = s.indexOf(".");
  if (firstDot !== -1) {
    s = s.slice(0, firstDot + 1) + s.slice(firstDot + 1).replace(/\./g, "");
  }
  return (neg ? "-" : "") + s;
}

/** Add thousands separators to a plain numeric string while typing (keeps trailing decimal). */
export function groupThousands(raw: string): string {
  if (!raw) return raw;
  const neg = raw.startsWith("-");
  const body = neg ? raw.slice(1) : raw;
  const [intPart, decPart] = body.split(".");
  const groupedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const result = decPart !== undefined ? `${groupedInt}.${decPart}` : groupedInt;
  return (neg ? "-" : "") + result;
}
