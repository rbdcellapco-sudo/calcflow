"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { clearHistory, getSettings, reorderFavorites, updateSettings } from "@/lib/storage";

const CURRENCIES = [
  { value: "USD", label: "US Dollar (USD)" },
  { value: "INR", label: "Indian Rupee (INR)" },
  { value: "EUR", label: "Euro (EUR)" },
  { value: "GBP", label: "British Pound (GBP)" },
  { value: "CAD", label: "Canadian Dollar (CAD)" },
  { value: "AUD", label: "Australian Dollar (AUD)" },
];

export function SettingsView() {
  const [currency, setCurrency] = useState("USD");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setCurrency(getSettings().currency);
  }, []);

  function handleCurrencyChange(value: string) {
    setCurrency(value);
    updateSettings({ currency: value });
  }

  function handleClearFavorites() {
    if (window.confirm("Remove all favorites?")) {
      reorderFavorites([]);
      setMessage("Favorites cleared.");
      setTimeout(() => setMessage(null), 2000);
    }
  }

  function handleClearHistory() {
    if (window.confirm("Clear all history?")) {
      clearHistory();
      setMessage("History cleared.");
      setTimeout(() => setMessage(null), 2000);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <Card className="p-4 sm:p-5 flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-text">Appearance</h2>
        <ThemeToggle />
        <p className="text-xs text-text-muted">Choose light, dark, or match your system setting. Saved on this device.</p>
      </Card>

      <Card className="p-4 sm:p-5 flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-text">Default currency</h2>
        <select
          className="w-full min-h-11 rounded-[var(--radius-sm)] border border-border bg-surface px-3.5 text-[16px] text-text"
          value={currency}
          onChange={(e) => handleCurrencyChange(e.target.value)}
        >
          {CURRENCIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
        <p className="text-xs text-text-muted">Used to format currency results across finance calculators.</p>
      </Card>

      <Card className="p-4 sm:p-5 flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-text">Your data</h2>
        <p className="text-xs text-text-secondary">
          CalcFlow stores favorites, history, and preferences only on this device. Nothing is sent to a server and no
          account is required.
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" size="sm" onClick={handleClearFavorites}>
            Clear favorites
          </Button>
          <Button variant="outline" size="sm" onClick={handleClearHistory}>
            Clear history
          </Button>
        </div>
        {message ? <p className="text-xs text-success">{message}</p> : null}
      </Card>

      <p className="text-xs text-text-muted text-center">CalcFlow · Every calculation. One simple app.</p>
    </div>
  );
}
