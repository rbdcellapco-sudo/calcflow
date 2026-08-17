import { KeyRound } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef } from "../types";
import { numberField } from "../validation";
import { Decimal, toMoney } from "../decimal-utils";

export const autoLeaseSchema = z.object({
  vehiclePrice: numberField({ label: "Negotiated (capitalized) price", min: 0, max: 10_000_000 }),
  downPayment: numberField({ label: "Down payment (cap cost reduction)", min: 0, max: 10_000_000, required: false }),
  residualPercent: numberField({ label: "Residual value", min: 0, max: 100 }),
  annualRate: numberField({ label: "Annual interest rate", min: 0, max: 100 }),
  termMonths: numberField({ label: "Lease term (months)", min: 1, max: 60 }),
  salesTaxRate: numberField({ label: "Sales tax rate", min: 0, max: 30, required: false }),
});

export type AutoLeaseValues = z.infer<typeof autoLeaseSchema>;

function calculate(values: AutoLeaseValues): CalcResult {
  const price = new Decimal(values.vehiclePrice);
  const downPayment = new Decimal(values.downPayment ?? 0);
  const adjustedCapCost = price.minus(downPayment);
  const residualValue = price.times(new Decimal(values.residualPercent).dividedBy(100));

  // Money factor is the industry convention: annual rate % ÷ 2400.
  const moneyFactor = new Decimal(values.annualRate).dividedBy(2400);

  const depreciationFee = adjustedCapCost.minus(residualValue).dividedBy(values.termMonths);
  const financeFee = adjustedCapCost.plus(residualValue).times(moneyFactor);
  const basePayment = depreciationFee.plus(financeFee);

  const taxRate = new Decimal(values.salesTaxRate ?? 0).dividedBy(100);
  const tax = basePayment.times(taxRate);
  const totalMonthlyPayment = basePayment.plus(tax);

  return {
    primary: { key: "monthlyPayment", label: "Monthly lease payment", value: toMoney(totalMonthlyPayment), format: "currency" },
    secondary: [
      { key: "depreciationFee", label: "Depreciation fee", value: toMoney(depreciationFee), format: "currency" },
      { key: "financeFee", label: "Finance (rent) fee", value: toMoney(financeFee), format: "currency" },
      { key: "residualValue", label: "Residual value", value: toMoney(residualValue), format: "currency" },
      { key: "totalOfPayments", label: "Total of lease payments", value: toMoney(totalMonthlyPayment.times(values.termMonths)), format: "currency" },
    ],
  };
}

export const autoLeaseCalculator: CalculatorDef = {
  id: "auto-lease",
  slug: "auto-lease",
  title: "Auto Lease Calculator",
  description: "Estimate your monthly car lease payment from cap cost, residual value, and money factor.",
  category: "finance",
  icon: KeyRound,
  keywords: ["car lease", "auto lease", "money factor", "residual value"],
  inputs: [
    { name: "vehiclePrice", label: "Negotiated (capitalized) price", kind: "currency", defaultValue: "", required: true },
    { name: "residualPercent", label: "Residual value (% of price)", kind: "percentage", defaultValue: "55", required: true },
    { name: "annualRate", label: "Annual interest rate (%)", kind: "percentage", defaultValue: "", required: true, helpText: "Converted internally to a money factor (rate ÷ 2400)." },
    { name: "termMonths", label: "Lease term (months)", kind: "number", defaultValue: "36", min: 1, max: 60, step: 1, required: true },
  ],
  advancedInputs: [
    { name: "downPayment", label: "Down payment (cap cost reduction)", kind: "currency", defaultValue: "0", required: false },
    { name: "salesTaxRate", label: "Sales tax rate (%)", kind: "percentage", defaultValue: "0", required: false },
  ],
  schema: autoLeaseSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  formula: "Payment = (Adjusted cap cost − Residual value) ÷ Term + (Adjusted cap cost + Residual value) × Money factor, where money factor = annual rate ÷ 2400.",
  explanation: [
    {
      heading: "Why leases use a money factor",
      body: "Dealers often quote a money factor instead of an interest rate. Multiplying a money factor by 2400 converts it to an approximate equivalent annual percentage rate.",
    },
  ],
  faq: [
    { q: "What's a good residual value?", a: "Higher residual values (a car expected to hold its value well) generally mean lower monthly lease payments, since you're financing less depreciation." },
  ],
  related: ["auto-loan", "lease", "loan"],
};
