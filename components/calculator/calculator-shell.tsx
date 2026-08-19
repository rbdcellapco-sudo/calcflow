"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { CalcResult, CalculatorDef } from "@/lib/types";
import { getCalculatorBySlug } from "@/lib/registry";
import { getSettings, addHistoryEntry } from "@/lib/storage";
import { CalculatorHeader } from "./calculator-header";
import { CalculatorInput } from "./calculator-input";
import { AdvancedOptions } from "./advanced-options";
import { ResultCard } from "./result-card";
import { ResultBreakdown } from "./result-breakdown";
import { FormulaCard } from "./formula-card";
import { ExplanationCard } from "./explanation-card";
import { ActionsRow } from "./actions-row";
import { Button } from "@/components/ui/button";
import { formatResultValue } from "@/lib/format";
import { ScientificCalculator } from "@/components/scientific/scientific-calculator";
import { CurrencyCalculator } from "@/components/currency/currency-calculator";

function defaultValues(def: CalculatorDef): Record<string, string> {
  const values: Record<string, string> = {};
  for (const field of [...def.inputs, ...(def.advancedInputs ?? [])]) {
    values[field.name] = field.defaultValue !== undefined ? String(field.defaultValue) : "";
  }
  return values;
}

function buildQueryString(values: Record<string, string>, defaults: Record<string, string>): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(values)) {
    if (value !== "" && value !== defaults[key]) {
      params.set(key, value);
    }
  }
  return params.toString();
}

/** Only accept query params that correspond to a real input field on this
 * calculator, and coerce to plain strings - keeps shared URLs safe and
 * predictable even if extra/garbage params are appended. */
function sanitizeParams(def: CalculatorDef, searchParams: URLSearchParams): Record<string, string> {
  const allowedNames = new Set([...def.inputs, ...(def.advancedInputs ?? [])].map((f) => f.name));
  if (def.custom) allowedNames.add("expr");

  const result: Record<string, string> = {};
  for (const [key, value] of searchParams.entries()) {
    if (!allowedNames.has(key) || key in result) continue;
    result[key] = value.slice(0, 200);
  }
  return result;
}

export function CalculatorShell({ slug }: { slug: string }) {
  const def = getCalculatorBySlug(slug);
  const searchParams = useSearchParams();
  const initialParams = useMemo(
    () => (def ? sanitizeParams(def, searchParams) : {}),
    [def, searchParams]
  );

  if (!def) {
    return <p className="text-text-secondary">Calculator not found.</p>;
  }

  if (def.custom) {
    return (
      <div className="flex flex-col gap-5">
        <CalculatorHeader def={def} />
        {def.slug === "currency" ? (
          <CurrencyCalculator />
        ) : (
          <ScientificCalculator def={def} initialExpression={initialParams.expr} />
        )}
        <FormulaCard formula={def.formula} />
        <ExplanationCard explanation={def.explanation} faq={def.faq} />
      </div>
    );
  }

  return <GenericCalculatorShell def={def} initialParams={initialParams} />;
}

function GenericCalculatorShell({
  def,
  initialParams,
}: {
  def: CalculatorDef;
  initialParams: Record<string, string>;
}) {
  const defaults = useMemo(() => defaultValues(def), [def]);
  const [values, setValues] = useState<Record<string, string>>(() => ({ ...defaults, ...initialParams }));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [result, setResult] = useState<CalcResult | null>(null);
  const [settings, setSettings] = useState(() => getSettings());

  useEffect(() => {
    setSettings(getSettings());
  }, []);

  // Reset local state when navigating between calculators (slug changes)
  useEffect(() => {
    setValues({ ...defaults, ...initialParams });
    setErrors({});
    setResult(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [def.slug]);

  const hasInitialParams = Object.keys(initialParams).length > 0;

  function runCalculation(currentValues: Record<string, string>) {
    const parsed = def.schema.safeParse(currentValues);
    if (!parsed.success) {
      const nextErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "");
        if (key && !nextErrors[key]) nextErrors[key] = issue.message;
      }
      setErrors(nextErrors);
      setResult(null);
      return;
    }
    setErrors({});
    try {
      const calcResult = def.calculate(parsed.data as Record<string, unknown>);
      setResult(calcResult);

      const qs = buildQueryString(currentValues, defaults);
      const url = `${window.location.pathname}${qs ? `?${qs}` : ""}`;
      window.history.replaceState(null, "", url);

      addHistoryEntry({
        slug: def.slug,
        title: def.title,
        summary: `${calcResult.primary.label}: ${formatResultValue(calcResult.primary, settings.currency, settings.locale)}`,
        params: Object.fromEntries(Object.entries(currentValues).filter(([, v]) => v !== "")),
      });
    } catch (err) {
      setResult(null);
      setErrors({ _form: err instanceof Error ? err.message : "Something went wrong calculating this result." });
    }
  }

  useEffect(() => {
    if (hasInitialParams) {
      runCalculation({ ...defaults, ...initialParams });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [def.slug]);

  function handleChange(name: string, value: string) {
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  function handleReset() {
    setValues(defaults);
    setErrors({});
    setResult(null);
    window.history.replaceState(null, "", window.location.pathname);
  }

  const hasSignificantInput = Object.entries(values).some(([k, v]) => v !== "" && v !== defaults[k]);

  const labels = def.dynamicLabels ? def.dynamicLabels(values) : {};

  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    const qs = buildQueryString(values, defaults);
    return `${window.location.origin}${window.location.pathname}${qs ? `?${qs}` : ""}`;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values, defaults]);

  const copyText = result
    ? [
        `${def.title}`,
        `${result.primary.label}: ${formatResultValue(result.primary, settings.currency, settings.locale)}`,
        ...result.secondary.map((s) => `${s.label}: ${formatResultValue(s, settings.currency, settings.locale)}`),
      ].join("\n")
    : def.title;

  return (
    <div className="flex flex-col gap-5">
      <CalculatorHeader def={def} />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          runCalculation(values);
        }}
        className="flex flex-col gap-4 bg-surface border border-border rounded-[var(--radius-md)] p-4 sm:p-5"
        noValidate
      >
        {def.inputs.map((field) => (
          <CalculatorInput
            key={field.name}
            field={field}
            value={values[field.name] ?? ""}
            onChange={(v) => handleChange(field.name, v)}
            error={errors[field.name]}
            currency={settings.currency}
            label={labels[field.name]}
          />
        ))}

        {def.advancedInputs && def.advancedInputs.length > 0 ? (
          <AdvancedOptions>
            {def.advancedInputs.map((field) => (
              <CalculatorInput
                key={field.name}
                field={field}
                value={values[field.name] ?? ""}
                onChange={(v) => handleChange(field.name, v)}
                error={errors[field.name]}
                currency={settings.currency}
                label={labels[field.name]}
              />
            ))}
          </AdvancedOptions>
        ) : null}

        {errors._form ? (
          <p className="text-sm text-danger" role="alert">
            {errors._form}
          </p>
        ) : null}

        <Button type="submit" size="lg" className="w-full">
          {result ? "Recalculate" : "Calculate"}
        </Button>
      </form>

      {result ? (
        <div className="flex flex-col gap-4 animate-fade-in-up">
          <ResultCard result={result.primary} currency={settings.currency} locale={settings.locale} />
          {result.notes && result.notes.length > 0 ? (
            <p className="text-sm text-text-secondary -mt-2 px-1">{result.notes.join(" ")}</p>
          ) : null}
          <ResultBreakdown results={result.secondary} currency={settings.currency} locale={settings.locale} />
          <ActionsRow
            slug={def.slug}
            shareUrl={shareUrl}
            copyText={copyText}
            onReset={handleReset}
            hasSignificantInput={hasSignificantInput}
          />
        </div>
      ) : null}

      <FormulaCard formula={def.formula} />
      <ExplanationCard explanation={def.explanation} faq={def.faq} />
    </div>
  );
}
