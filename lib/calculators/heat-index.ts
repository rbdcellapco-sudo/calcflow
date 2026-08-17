import { Sun } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef } from "../types";
import { numberField } from "../validation";

export const heatIndexSchema = z.object({
  tempF: numberField({ label: "Temperature (°F)", min: -100, max: 200 }),
  humidity: numberField({ label: "Relative humidity (%)", min: 0, max: 100 }),
});

export type HeatIndexValues = z.infer<typeof heatIndexSchema>;

function calculate(values: HeatIndexValues): CalcResult {
  const { tempF: T, humidity: RH } = values;

  if (T < 80) {
    return {
      primary: { key: "heatIndex", label: "Heat index", value: Math.round(T), format: "number", unit: "°F" },
      secondary: [],
      notes: ["Heat index is only meaningfully different from air temperature at 80°F and above — showing actual temperature."],
    };
  }

  const heatIndex =
    -42.379 +
    2.04901523 * T +
    10.14333127 * RH -
    0.22475541 * T * RH -
    0.00683783 * T * T -
    0.05481717 * RH * RH +
    0.00122874 * T * T * RH +
    0.00085282 * T * RH * RH -
    0.00000199 * T * T * RH * RH;

  let riskLevel = "Caution";
  if (heatIndex >= 125) riskLevel = "Extreme danger";
  else if (heatIndex >= 105) riskLevel = "Danger";
  else if (heatIndex >= 90) riskLevel = "Extreme caution";

  return {
    primary: { key: "heatIndex", label: "Heat index (feels like)", value: Math.round(heatIndex * 10) / 10, format: "number", unit: "°F" },
    secondary: [{ key: "riskLevel", label: "Heat risk category", value: riskLevel, format: "text" }],
  };
}

export const heatIndexCalculator: CalculatorDef = {
  id: "heat-index",
  slug: "heat-index",
  title: "Heat Index Calculator",
  description: "Calculate how hot it feels outside, accounting for humidity.",
  category: "other",
  icon: Sun,
  keywords: ["heat index", "feels like temperature", "humidity heat"],
  inputs: [
    { name: "tempF", label: "Temperature (°F)", kind: "number", defaultValue: "", step: 0.1, required: true },
    { name: "humidity", label: "Relative humidity (%)", kind: "percentage", defaultValue: "", required: true },
  ],
  schema: heatIndexSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  formula: "US National Weather Service Rothfusz regression, a polynomial in temperature (°F) and relative humidity (%).",
  explanation: [
    {
      heading: "Why humidity makes it feel hotter",
      body: "Sweat cools you by evaporating — high humidity slows evaporation, so your body can't shed heat as effectively, making the air feel hotter than the thermometer reads.",
    },
  ],
  faq: [
    { q: "What heat index level is dangerous?", a: "The NWS considers 105°F+ 'danger' territory (heat cramps/exhaustion likely) and 125°F+ 'extreme danger' (heat stroke highly likely with continued exposure)." },
  ],
  related: ["wind-chill", "dew-point"],
};
