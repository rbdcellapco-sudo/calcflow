import { Binary } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef } from "../types";
import { selectField } from "../validation";

const MODES = ["encode", "decode"] as const;

export const base64Schema = z.object({
  mode: selectField(MODES, "Mode"),
  input: z.string().min(1, "Enter text to convert"),
});

export type Base64Values = z.infer<typeof base64Schema>;

function calculate(values: Base64Values): CalcResult {
  try {
    if (values.mode === "encode") {
      const encoded = btoa(unescape(encodeURIComponent(values.input)));
      return { primary: { key: "output", label: "Base64 encoded", value: encoded, format: "text" }, secondary: [] };
    }
    const decoded = decodeURIComponent(escape(atob(values.input)));
    return { primary: { key: "output", label: "Decoded text", value: decoded, format: "text" }, secondary: [] };
  } catch {
    throw new Error(values.mode === "decode" ? "This isn't valid Base64 text" : "Couldn't encode this text");
  }
}

export const base64Calculator: CalculatorDef = {
  id: "base64",
  slug: "base64",
  title: "Base64 Encode/Decode",
  description: "Encode text to Base64, or decode Base64 back to plain text.",
  category: "other",
  icon: Binary,
  keywords: ["base64 encode", "base64 decode", "base64 converter"],
  inputs: [
    {
      name: "mode",
      label: "Mode",
      kind: "segmented",
      defaultValue: "encode",
      options: [
        { value: "encode", label: "Encode" },
        { value: "decode", label: "Decode" },
      ],
    },
    { name: "input", label: "Input", kind: "text", defaultValue: "", required: true },
  ],
  schema: base64Schema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  formula: "Base64 represents binary data as ASCII text using a 64-character alphabet, processed entirely in your browser.",
  explanation: [
    {
      heading: "Not encryption",
      body: "Base64 is an encoding scheme, not a security measure — anyone can decode it instantly. Don't use it to hide sensitive information.",
    },
  ],
  faq: [
    { q: "Does this handle Unicode text?", a: "Yes — non-ASCII characters (like emoji or accented letters) are UTF-8 encoded first, then Base64 encoded, and decoded back correctly in reverse." },
  ],
  related: ["url-encode"],
};
