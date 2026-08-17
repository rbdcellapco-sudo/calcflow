import { Landmark } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef } from "../types";
import { numberField } from "../validation";
import { Decimal, toMoney, toRounded } from "../decimal-utils";

// India new tax regime slabs (FY 2024-25 / AY 2025-26). Rates change yearly —
// treat this as an illustrative estimate, not tax advice.
const SLABS: { upTo: number; rate: number }[] = [
  { upTo: 300_000, rate: 0 },
  { upTo: 700_000, rate: 5 },
  { upTo: 1_000_000, rate: 10 },
  { upTo: 1_200_000, rate: 15 },
  { upTo: 1_500_000, rate: 20 },
  { upTo: Infinity, rate: 30 },
];

export const incomeTaxSchema = z.object({
  annualIncome: numberField({ label: "Annual gross income", min: 0, max: 1_000_000_000 }),
  standardDeduction: numberField({ label: "Standard deduction", min: 0, max: 1_000_000, required: false }),
});

export type IncomeTaxValues = z.infer<typeof incomeTaxSchema>;

function calculate(values: IncomeTaxValues): CalcResult {
  const standardDeduction = new Decimal(values.standardDeduction ?? 75_000);
  const taxableIncome = Decimal.max(new Decimal(values.annualIncome).minus(standardDeduction), 0);

  let tax = new Decimal(0);
  let lowerBound = new Decimal(0);
  for (const slab of SLABS) {
    if (taxableIncome.lessThanOrEqualTo(lowerBound)) break;
    const upTo = new Decimal(slab.upTo === Infinity ? taxableIncome.toNumber() : slab.upTo);
    const slabAmount = Decimal.min(taxableIncome, upTo).minus(lowerBound);
    if (slabAmount.greaterThan(0)) {
      tax = tax.plus(slabAmount.times(slab.rate).dividedBy(100));
    }
    lowerBound = upTo;
  }

  // Section 87A rebate: tax is fully waived if taxable income doesn't exceed ₹7,00,000
  // (marginal relief above that threshold isn't modeled here).
  const rebateApplied = taxableIncome.lessThanOrEqualTo(700_000);
  if (rebateApplied) tax = new Decimal(0);

  const cess = tax.times(0.04);
  const totalTax = tax.plus(cess);
  const netIncome = new Decimal(values.annualIncome).minus(totalTax);
  const effectiveRate = new Decimal(values.annualIncome).isZero() ? new Decimal(0) : totalTax.dividedBy(values.annualIncome).times(100);

  return {
    primary: { key: "totalTax", label: "Estimated tax payable", value: toMoney(totalTax), format: "currency" },
    secondary: [
      { key: "taxableIncome", label: "Taxable income", value: toMoney(taxableIncome), format: "currency" },
      { key: "cess", label: "Health & education cess (4%)", value: toMoney(cess), format: "currency" },
      { key: "netIncome", label: "Net income after tax", value: toMoney(netIncome), format: "currency" },
      { key: "effectiveRate", label: "Effective tax rate", value: toRounded(effectiveRate), format: "percentage" },
    ],
    notes: [
      "Estimate only, using India's New Tax Regime slabs for FY 2024-25 (AY 2025-26), including the standard deduction and Section 87A rebate. Doesn't model marginal relief, surcharge, or other deductions. Confirm with the Income Tax Department or a tax professional.",
    ],
  };
}

export const incomeTaxCalculator: CalculatorDef = {
  id: "income-tax",
  slug: "income-tax",
  title: "Income Tax Calculator",
  description: "Estimate income tax under India's New Tax Regime slabs.",
  category: "finance",
  icon: Landmark,
  region: "India",
  keywords: ["income tax", "tax slabs", "new tax regime", "india tax"],
  inputs: [
    { name: "annualIncome", label: "Annual gross income", kind: "currency", defaultValue: "", required: true },
  ],
  advancedInputs: [
    { name: "standardDeduction", label: "Standard deduction", kind: "currency", defaultValue: "75000", required: false },
  ],
  schema: incomeTaxSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  formula: "Tax is computed progressively across income slabs, then a 4% health & education cess is added. A full rebate applies (net tax = 0) if taxable income is at or below ₹7,00,000.",
  explanation: [
    {
      heading: "New vs. old tax regime",
      body: "India's New Tax Regime offers lower slab rates but fewer deductions than the Old Regime. This calculator only models the New Regime, which is now the default option.",
    },
  ],
  faq: [
    { q: "Why is my tax shown as zero?", a: "The Section 87A rebate makes tax payable zero when taxable income (after the standard deduction) is ₹7,00,000 or less." },
  ],
  related: ["salary", "sales-tax", "budget"],
};
