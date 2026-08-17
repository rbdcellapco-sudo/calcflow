"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowUpDown, RefreshCw } from "lucide-react";
import { getCachedRates, setCachedRates, type CachedRates } from "@/lib/storage";
import { groupThousands, sanitizeNumericInput } from "@/lib/format";
import { cn } from "@/lib/cn";

const COMMON_CURRENCIES = [
  "USD", "INR", "EUR", "GBP", "JPY", "AUD", "CAD", "CHF", "CNY", "SGD",
  "AED", "HKD", "NZD", "SEK", "NOK", "ZAR", "BRL", "MXN", "KRW", "THB",
];

const RATES_MAX_AGE_MS = 12 * 60 * 60 * 1000; // 12 hours
const API_BASE = "https://open.er-api.com/v6/latest";

async function fetchRates(base: string): Promise<CachedRates> {
  const res = await fetch(`${API_BASE}/${base}`);
  if (!res.ok) throw new Error("Failed to fetch exchange rates");
  const json = await res.json();
  if (json.result !== "success" || !json.rates) throw new Error("Exchange rate service returned an error");
  return { base, rates: json.rates as Record<string, number>, fetchedAt: Date.now() };
}

function formatAsOf(fetchedAt: number): string {
  const diffMs = Date.now() - fetchedAt;
  const diffMin = Math.round(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.round(diffHr / 24);
  return `${diffDay}d ago`;
}

export function CurrencyCalculator() {
  const [amount, setAmount] = useState("1");
  const [from, setFrom] = useState("USD");
  const [to, setTo] = useState("INR");
  const [rates, setRates] = useState<CachedRates | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadRates(base: string) {
    setLoading(true);
    setError(null);
    try {
      const fresh = await fetchRates(base);
      setCachedRates(fresh);
      setRates(fresh);
    } catch {
      const cached = getCachedRates();
      if (cached && cached.base === base) {
        setRates(cached);
        setError("Couldn't refresh rates — showing the last cached rates.");
      } else {
        setError("Couldn't load exchange rates. Check your connection and try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const cached = getCachedRates();
    if (cached && cached.base === "USD" && Date.now() - cached.fetchedAt < RATES_MAX_AGE_MS) {
      setRates(cached);
    } else {
      loadRates("USD");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const result = useMemo(() => {
    if (!rates) return null;
    const numericAmount = Number(amount.replace(/,/g, "")) || 0;
    const fromRate = from === rates.base ? 1 : rates.rates[from];
    const toRate = to === rates.base ? 1 : rates.rates[to];
    if (!fromRate || !toRate) return null;
    const inBase = numericAmount / fromRate;
    const converted = inBase * toRate;
    const rate = toRate / fromRate;
    return { converted, rate };
  }, [rates, amount, from, to]);

  function swap() {
    setFrom(to);
    setTo(from);
  }

  function handleAmountChange(raw: string) {
    setAmount(sanitizeNumericInput(raw));
  }

  const selectClasses =
    "min-h-11 rounded-[var(--radius-sm)] border border-border bg-surface px-3 text-[16px] text-text focus-visible:outline-none focus:border-accent";

  return (
    <div className="flex flex-col gap-4 bg-surface border border-border rounded-[var(--radius-md)] p-3 sm:p-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="currency-amount" className="text-sm font-medium text-text">
          Amount
        </label>
        <input
          id="currency-amount"
          type="text"
          inputMode="decimal"
          value={groupThousands(amount)}
          onChange={(e) => handleAmountChange(e.target.value)}
          className="w-full min-h-11 rounded-[var(--radius-sm)] border border-border bg-surface px-3.5 text-[18px] text-text focus-visible:outline-none focus:border-accent"
        />
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="currency-from" className="text-sm font-medium text-text">
            From
          </label>
          <select id="currency-from" className={selectClasses} value={from} onChange={(e) => setFrom(e.target.value)}>
            {COMMON_CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={swap}
          aria-label="Swap currencies"
          className="mb-0.5 flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface-2 text-text-secondary hover:bg-border transition-colors"
        >
          <ArrowUpDown className="h-4 w-4" />
        </button>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="currency-to" className="text-sm font-medium text-text">
            To
          </label>
          <select id="currency-to" className={selectClasses} value={to} onChange={(e) => setTo(e.target.value)}>
            {COMMON_CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div
        className="min-h-20 rounded-[var(--radius-sm)] bg-surface-2 px-4 py-3 flex flex-col items-center justify-center gap-1"
        role="status"
        aria-live="polite"
      >
        {result ? (
          <>
            <span className="text-3xl sm:text-4xl font-semibold text-text tabular-nums text-center">
              {result.converted.toLocaleString(undefined, { maximumFractionDigits: 2 })} {to}
            </span>
            <span className="text-xs text-text-muted text-center">
              1 {from} = {result.rate.toLocaleString(undefined, { maximumFractionDigits: 6 })} {to}
            </span>
          </>
        ) : (
          <span className="text-sm text-text-muted">{loading ? "Loading rates…" : "Rates unavailable"}</span>
        )}
      </div>

      <div className="flex items-center justify-between gap-2 text-xs text-text-muted">
        <span>{rates ? `Rates as of ${formatAsOf(rates.fetchedAt)}` : error ? error : null}</span>
        <button
          type="button"
          onClick={() => loadRates("USD")}
          disabled={loading}
          className={cn("flex items-center gap-1 text-accent hover:underline disabled:opacity-50", loading && "animate-pulse")}
        >
          <RefreshCw className="h-3 w-3" />
          Refresh
        </button>
      </div>
      {error && rates ? <p className="text-xs text-danger">{error}</p> : null}
    </div>
  );
}
