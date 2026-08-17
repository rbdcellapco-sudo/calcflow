import { Wind } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef } from "../types";
import { numberField } from "../validation";

export const windChillSchema = z.object({
  tempF: numberField({ label: "Temperature (°F)", min: -100, max: 200 }),
  windMph: numberField({ label: "Wind speed (mph)", min: 0, max: 200 }),
});

export type WindChillValues = z.infer<typeof windChillSchema>;

function calculate(values: WindChillValues): CalcResult {
  const { tempF, windMph } = values;

  if (tempF > 50 || windMph < 3) {
    return {
      primary: { key: "windChill", label: "Wind chill", value: Math.round(tempF), format: "number", unit: "°F" },
      secondary: [],
      notes: ["Wind chill isn't meaningfully different from air temperature above 50°F or below 3 mph wind — showing actual temperature."],
    };
  }

  const windChill = 35.74 + 0.6215 * tempF - 35.75 * Math.pow(windMph, 0.16) + 0.4275 * tempF * Math.pow(windMph, 0.16);

  return {
    primary: { key: "windChill", label: "Wind chill", value: Math.round(windChill * 10) / 10, format: "number", unit: "°F" },
    secondary: [{ key: "actualTemp", label: "Actual temperature", value: tempF, format: "number", unit: "°F" }],
  };
}

export const windChillCalculator: CalculatorDef = {
  id: "wind-chill",
  slug: "wind-chill",
  title: "Wind Chill Calculator",
  description: "Calculate how cold it feels outside, accounting for wind speed.",
  category: "other",
  icon: Wind,
  keywords: ["wind chill", "feels like temperature", "wind chill factor"],
  inputs: [
    { name: "tempF", label: "Temperature (°F)", kind: "number", defaultValue: "", step: 0.1, required: true },
    { name: "windMph", label: "Wind speed (mph)", kind: "number", defaultValue: "", min: 0, step: 0.1, required: true },
  ],
  schema: windChillSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  formula: "US National Weather Service formula: WC = 35.74 + 0.6215T − 35.75V^0.16 + 0.4275TV^0.16, where T is °F and V is mph.",
  explanation: [
    {
      heading: "Why wind makes it feel colder",
      body: "Wind strips away the thin layer of warm air your body naturally holds near your skin, speeding up heat loss — the stronger the wind, the faster that warm layer is replaced with cold air.",
    },
  ],
  faq: [
    { q: "Does this apply in summer?", a: "No — the wind chill formula is only valid (and meaningful) at temperatures at or below 50°F with wind of at least 3 mph." },
  ],
  related: ["heat-index", "dew-point"],
};
