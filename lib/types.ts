import type { LucideIcon } from "lucide-react";
import type { ZodTypeAny } from "zod";

/** Top-level calculator categories. Keep in sync with lib/categories.ts */
export type CategoryId =
  | "finance"
  | "health"
  | "math"
  | "date"
  | "conversion"
  | "other";

export type InputKind =
  | "number"
  | "currency"
  | "percentage"
  | "select"
  | "date"
  | "toggle"
  | "segmented"
  | "text";

export type SelectOption = {
  value: string;
  label: string;
};

/** A single field in a calculator's input form. */
export type InputField = {
  /** Key matching the calculator's Zod schema / values object */
  name: string;
  label: string;
  kind: InputKind;
  placeholder?: string;
  helpText?: string;
  defaultValue?: string | number | boolean;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  options?: SelectOption[];
  /** For currency inputs: allow overriding the currency symbol/code */
  currency?: string;
  required?: boolean;
};

/** A single named value produced by a calculate() call. */
export type ResultValue = {
  key: string;
  label: string;
  value: string | number;
  /** How to format this value for display */
  format?: "currency" | "percentage" | "number" | "years" | "text";
  unit?: string;
  emphasis?: boolean;
};

export type CalcResult = {
  primary: ResultValue;
  secondary: ResultValue[];
  /** Optional structured data a calculator can use for tables/charts (e.g. amortization rows) */
  table?: Record<string, string | number>[];
  /** Optional free-form notes/warnings surfaced under results */
  notes?: string[];
};

export type ChartSpec = {
  id: string;
  title: string;
  kind: "line" | "bar" | "pie";
};

export type ContentBlock = {
  heading: string;
  body: string;
};

export type FaqItem = { q: string; a: string };

/**
 * The single source of truth for a calculator: metadata, inputs, validation,
 * calculation engine, and explanatory content. Everything the generic
 * CalculatorShell needs to render a working calculator lives here.
 */
export type CalculatorDef<TValues extends Record<string, unknown> = Record<string, unknown>> = {
  id: string;
  slug: string;
  title: string;
  /** Short description used in cards/search results */
  description: string;
  category: CategoryId;
  icon: LucideIcon;
  /** Extra terms this calculator should match on in search (synonyms) */
  keywords?: string[];
  /** e.g. "US" - labels a region-specific calculator */
  region?: string;
  inputs: InputField[];
  advancedInputs?: InputField[];
  schema: ZodTypeAny;
  calculate: (values: TValues) => CalcResult;
  charts?: ChartSpec[];
  formula?: string;
  explanation?: ContentBlock[];
  faq?: FaqItem[];
  related: string[];
  /**
   * Calculators with fully custom UI (e.g. the scientific calculator keypad)
   * set this so the shell renders a custom component instead of the generic
   * input-driven form. The registry entry is still used for metadata,
   * search, favorites, and history.
   */
  custom?: boolean;
  /**
   * Optional hook letting a calculator relabel inputs based on current
   * (raw string) field values - e.g. a "mode" select that changes what the
   * following numeric fields mean. Keeps the shell generic while allowing
   * per-calculator UX polish.
   */
  dynamicLabels?: (values: Record<string, string>) => Record<string, string>;
};

export type HistoryEntry = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  timestamp: number;
  params: Record<string, string>;
};

export type ThemePreference = "light" | "dark" | "system";

export type Settings = {
  theme: ThemePreference;
  currency: string;
  locale: string;
};
