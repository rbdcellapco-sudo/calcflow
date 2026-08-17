import { Droplet } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef } from "../types";
import { numberField } from "../validation";

export const dewPointSchema = z.object({
  tempF: numberField({ label: "Temperature (°F)", min: -100, max: 200 }),
  humidity: numberField({ label: "Relative humidity (%)", min: 1, max: 100 }),
});

export type DewPointValues = z.infer<typeof dewPointSchema>;

function calculate(values: DewPointValues): CalcResult {
  const tempC = ((values.tempF - 32) * 5) / 9;
  const a = 17.27;
  const b = 237.7;

  const alpha = (a * tempC) / (b + tempC) + Math.log(values.humidity / 100);
  const dewPointC = (b * alpha) / (a - alpha);
  const dewPointF = (dewPointC * 9) / 5 + 32;

  let comfort: string;
  if (dewPointF < 55) comfort = "Dry and comfortable";
  else if (dewPointF < 60) comfort = "Comfortable";
  else if (dewPointF < 65) comfort = "Slightly humid";
  else if (dewPointF < 70) comfort = "Humid";
  else if (dewPointF < 75) comfort = "Very humid";
  else comfort = "Oppressive";

  return {
    primary: { key: "dewPoint", label: "Dew point", value: Math.round(dewPointF * 10) / 10, format: "number", unit: "°F" },
    secondary: [{ key: "comfort", label: "Comfort level", value: comfort, format: "text" }],
  };
}

export const dewPointCalculator: CalculatorDef = {
  id: "dew-point",
  slug: "dew-point",
  title: "Dew Point Calculator",
  description: "Calculate the dew point temperature from air temperature and relative humidity.",
  category: "other",
  icon: Droplet,
  keywords: ["dew point calculator", "dew point temperature", "humidity comfort"],
  inputs: [
    { name: "tempF", label: "Temperature (°F)", kind: "number", defaultValue: "", step: 0.1, required: true },
    { name: "humidity", label: "Relative humidity (%)", kind: "percentage", defaultValue: "", required: true },
  ],
  schema: dewPointSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  formula: "Magnus-Tetens approximation: α = (17.27×T)/(237.7+T) + ln(RH/100); Dew point = (237.7×α)/(17.27−α), computed in Celsius then converted.",
  explanation: [
    {
      heading: "Why dew point beats relative humidity for comfort",
      body: "Relative humidity depends on temperature, so the same RH% feels very different on a cold day versus a hot one. Dew point is an absolute measure of moisture in the air, making it a more reliable comfort indicator.",
    },
  ],
  faq: [
    { q: "What dew point feels comfortable?", a: "Most people find dew points below 60°F comfortable, while 65°F+ starts to feel muggy and 70°F+ feels oppressive." },
  ],
  related: ["heat-index", "wind-chill"],
};
