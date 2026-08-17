import { Landmark as LandmarkIcon } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef } from "../types";
import { numberField, selectField } from "../validation";
import { Decimal, toMoney } from "../decimal-utils";

const FRA_OPTIONS = ["66", "66.5", "67"] as const;

export const socialSecuritySchema = z.object({
  fraBenefit: numberField({ label: "Estimated monthly benefit at full retirement age", min: 0, max: 1_000_000 }),
  fullRetirementAge: selectField(FRA_OPTIONS, "Full retirement age"),
  claimingAge: numberField({ label: "Claiming age", min: 62, max: 70 }),
});

export type SocialSecurityValues = z.infer<typeof socialSecuritySchema>;

function calculate(values: SocialSecurityValues): CalcResult {
  const fraBenefit = new Decimal(values.fraBenefit);
  const fra = Number(values.fullRetirementAge);
  const claimingAge = values.claimingAge;
  const monthsDiff = Math.round((claimingAge - fra) * 12);

  let adjustedBenefit: Decimal;
  let note: string;

  if (monthsDiff < 0) {
    const monthsEarly = Math.abs(monthsDiff);
    const first36 = Math.min(monthsEarly, 36);
    const beyond36 = Math.max(monthsEarly - 36, 0);
    // 5/9 of 1% per month for the first 36 months early, 5/12 of 1% per month beyond that.
    const reductionPercent = new Decimal(first36).times(5).dividedBy(9).plus(new Decimal(beyond36).times(5).dividedBy(12));
    adjustedBenefit = fraBenefit.times(new Decimal(100).minus(reductionPercent).dividedBy(100));
    note = `Claiming ${monthsEarly} months before full retirement age reduces your benefit by about ${reductionPercent.toFixed(2)}%.`;
  } else if (monthsDiff > 0) {
    const monthsLate = Math.min(monthsDiff, (70 - fra) * 12);
    // 2/3 of 1% per month delayed (8% per year), credits stop accruing at age 70.
    const increasePercent = new Decimal(monthsLate).times(2).dividedBy(3);
    adjustedBenefit = fraBenefit.times(new Decimal(100).plus(increasePercent).dividedBy(100));
    note = `Delaying ${monthsLate} months past full retirement age increases your benefit by about ${increasePercent.toFixed(2)}%.`;
  } else {
    adjustedBenefit = fraBenefit;
    note = "Claiming exactly at full retirement age pays your benefit at 100%.";
  }

  return {
    primary: { key: "adjustedBenefit", label: `Estimated monthly benefit at age ${claimingAge}`, value: toMoney(adjustedBenefit), format: "currency" },
    secondary: [
      { key: "fraBenefit", label: "Benefit at full retirement age", value: toMoney(fraBenefit), format: "currency" },
      { key: "annualBenefit", label: "Estimated annual benefit", value: toMoney(adjustedBenefit.times(12)), format: "currency" },
    ],
    notes: [
      note,
      "This is a simplified estimate using standard SSA early/delayed claiming adjustments applied to your own full-retirement-age estimate. It does not calculate your Primary Insurance Amount from earnings history — use your official Social Security Statement for that figure.",
    ],
  };
}

export const socialSecurityCalculator: CalculatorDef = {
  id: "social-security",
  slug: "social-security",
  title: "Social Security Calculator",
  description: "Estimate how claiming early or delaying affects your Social Security benefit.",
  category: "finance",
  icon: LandmarkIcon,
  region: "US",
  keywords: ["social security", "ssa", "claiming age", "retirement benefit"],
  inputs: [
    { name: "fraBenefit", label: "Estimated monthly benefit at full retirement age", kind: "currency", defaultValue: "", required: true, helpText: "Find this on your SSA statement at ssa.gov." },
    {
      name: "fullRetirementAge",
      label: "Full retirement age",
      kind: "select",
      defaultValue: "67",
      options: [
        { value: "66", label: "66" },
        { value: "66.5", label: "66 and 6 months" },
        { value: "67", label: "67" },
      ],
    },
    { name: "claimingAge", label: "Claiming age", kind: "number", defaultValue: "67", min: 62, max: 70, step: 1, required: true },
  ],
  schema: socialSecuritySchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  formula: "Early claiming reduces the benefit 5/9 of 1% per month for the first 36 months early, then 5/12 of 1% per month beyond that. Delayed claiming increases it 2/3 of 1% per month (8%/year) up to age 70.",
  explanation: [
    {
      heading: "Why claiming age matters so much",
      body: "Claiming at 62 instead of a full retirement age of 67 can permanently reduce your benefit by around 30%. Waiting until 70 can increase it by roughly 24% above the full-retirement-age amount.",
    },
  ],
  faq: [
    { q: "Where do I find my full-retirement-age benefit?", a: "Create or log into a my Social Security account at ssa.gov to see your personalized benefit estimate." },
  ],
  related: ["retirement", "pension", "401k"],
};
