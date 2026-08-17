import { Link } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef } from "../types";
import { selectField } from "../validation";

const MODES = ["encode", "decode"] as const;

export const urlEncodeSchema = z.object({
  mode: selectField(MODES, "Mode"),
  input: z.string().min(1, "Enter text to convert"),
});

export type UrlEncodeValues = z.infer<typeof urlEncodeSchema>;

function calculate(values: UrlEncodeValues): CalcResult {
  try {
    if (values.mode === "encode") {
      return { primary: { key: "output", label: "URL encoded", value: encodeURIComponent(values.input), format: "text" }, secondary: [] };
    }
    return { primary: { key: "output", label: "Decoded text", value: decodeURIComponent(values.input), format: "text" }, secondary: [] };
  } catch {
    throw new Error("This isn't validly encoded text");
  }
}

export const urlEncodeCalculator: CalculatorDef = {
  id: "url-encode",
  slug: "url-encode",
  title: "URL Encode/Decode",
  description: "Percent-encode text for use in a URL, or decode a percent-encoded URL string.",
  category: "other",
  icon: Link,
  keywords: ["url encode", "url decode", "percent encoding", "uri encode"],
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
  schema: urlEncodeSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  formula: "Percent-encoding replaces characters that aren't valid in a URL with a % followed by their hex byte value, per RFC 3986.",
  explanation: [
    {
      heading: "When you need this",
      body: "Encode text before putting it into a query string or URL path segment (e.g. spaces become %20) — otherwise special characters can break the URL or be misinterpreted.",
    },
  ],
  faq: [
    { q: "Why did decoding fail?", a: "Decoding fails if the input contains a '%' not followed by two valid hex digits — it isn't properly percent-encoded text." },
  ],
  related: ["base64"],
};
