import { z } from "zod";

/**
 * Shared Zod field builders used across calculator schemas. Calculator forms
 * store every value as a string (so currency/percentage inputs can show
 * formatted text while typing) and these helpers coerce + validate that
 * string, producing human-readable, field-scoped error messages.
 */

type NumberOpts = {
  label: string;
  min?: number;
  max?: number;
  integer?: boolean;
};

function buildNumberTransform(opts: NumberOpts & { required: boolean }) {
  const { label, min, max, integer = false, required } = opts;

  return z
    .string()
    .optional()
    .transform((raw, ctx): number | undefined => {
      const cleaned = (raw ?? "").replace(/,/g, "").trim();

      if (cleaned === "") {
        if (required) {
          ctx.addIssue({ code: "custom", message: `${label} is required` });
          return z.NEVER;
        }
        return undefined;
      }

      const n = Number(cleaned);
      if (Number.isNaN(n) || !Number.isFinite(n)) {
        ctx.addIssue({ code: "custom", message: `${label} must be a number` });
        return z.NEVER;
      }
      if (integer && !Number.isInteger(n)) {
        ctx.addIssue({ code: "custom", message: `${label} must be a whole number` });
        return z.NEVER;
      }
      if (min !== undefined && n < min) {
        ctx.addIssue({ code: "custom", message: `${label} must be at least ${min}` });
        return z.NEVER;
      }
      if (max !== undefined && n > max) {
        ctx.addIssue({ code: "custom", message: `${label} must be at most ${max}` });
        return z.NEVER;
      }
      return n;
    });
}

/** Required numeric field (default) - parses to `number`. */
export function numberField(opts: NumberOpts & { required?: true }): z.ZodType<number, unknown>;
/** Optional numeric field - parses to `number | undefined`. */
export function numberField(opts: NumberOpts & { required: false }): z.ZodType<number | undefined, unknown>;
export function numberField(opts: NumberOpts & { required?: boolean }) {
  const required = opts.required ?? true;
  return buildNumberTransform({ ...opts, required }) as unknown as z.ZodType<number, unknown>;
}

export function dateField(label: string) {
  return z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .refine((v) => !Number.isNaN(Date.parse(v)), `${label} must be a valid date`);
}

export function selectField<T extends readonly [string, ...string[]]>(values: T, label: string) {
  return z.enum(values, { error: () => `${label} is invalid` });
}
