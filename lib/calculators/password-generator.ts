import { KeyRound } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef } from "../types";
import { numberField } from "../validation";

export const passwordGeneratorSchema = z.object({
  length: numberField({ label: "Length", min: 4, max: 128, integer: true }),
  includeUppercase: z.string().optional(),
  includeLowercase: z.string().optional(),
  includeNumbers: z.string().optional(),
  includeSymbols: z.string().optional(),
});

export type PasswordGeneratorValues = z.infer<typeof passwordGeneratorSchema>;

const CHAR_SETS = {
  uppercase: "ABCDEFGHJKLMNPQRSTUVWXYZ",
  lowercase: "abcdefghijkmnpqrstuvwxyz",
  numbers: "23456789",
  symbols: "!@#$%^&*()-_=+[]{}",
};

function calculate(values: PasswordGeneratorValues): CalcResult {
  const useUpper = values.includeUppercase !== "false";
  const useLower = values.includeLowercase !== "false";
  const useNumbers = values.includeNumbers !== "false";
  const useSymbols = values.includeSymbols === "true";

  let pool = "";
  if (useUpper) pool += CHAR_SETS.uppercase;
  if (useLower) pool += CHAR_SETS.lowercase;
  if (useNumbers) pool += CHAR_SETS.numbers;
  if (useSymbols) pool += CHAR_SETS.symbols;

  if (!pool) throw new Error("Select at least one character type");

  let password = "";
  for (let i = 0; i < values.length; i++) {
    password += pool[Math.floor(Math.random() * pool.length)];
  }

  const poolSize = pool.length;
  const entropyBits = Math.round(values.length * Math.log2(poolSize));

  return {
    primary: { key: "password", label: "Generated password", value: password, format: "text" },
    secondary: [{ key: "entropy", label: "Estimated entropy", value: entropyBits, format: "number", unit: "bits" }],
    notes: ["Recalculate to generate a new password. This runs entirely in your browser — nothing is sent anywhere."],
  };
}

export const passwordGeneratorCalculator: CalculatorDef = {
  id: "password-generator",
  slug: "password-generator",
  title: "Password Generator",
  description: "Generate a random password with configurable length and character types.",
  category: "other",
  icon: KeyRound,
  keywords: ["password generator", "random password", "secure password", "strong password"],
  inputs: [
    { name: "length", label: "Length", kind: "number", defaultValue: "16", min: 4, max: 128, step: 1, required: true },
  ],
  advancedInputs: [
    { name: "includeUppercase", label: "Include uppercase (A-Z)", kind: "toggle", defaultValue: "true", required: false },
    { name: "includeLowercase", label: "Include lowercase (a-z)", kind: "toggle", defaultValue: "true", required: false },
    { name: "includeNumbers", label: "Include numbers (0-9)", kind: "toggle", defaultValue: "true", required: false },
    { name: "includeSymbols", label: "Include symbols (!@#$...)", kind: "toggle", defaultValue: "false", required: false },
  ],
  schema: passwordGeneratorSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  formula: "Each character is drawn independently and uniformly from the selected character sets. Entropy (bits) = length × log₂(pool size).",
  explanation: [
    {
      heading: "Ambiguous characters excluded",
      body: "Characters that are easy to confuse when read or typed (like 0/O, 1/l/I) are excluded from the character pool.",
    },
  ],
  faq: [
    { q: "Is this safe to use for real passwords?", a: "It uses standard (not cryptographically secure) browser randomness, which is fine for most personal use, but a password manager's built-in generator is preferable for high-security accounts." },
  ],
  related: ["random-number"],
};
