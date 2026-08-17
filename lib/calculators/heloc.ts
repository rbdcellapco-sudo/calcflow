import { Wallet } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef } from "../types";
import { numberField } from "../validation";
import { Decimal, monthlyPayment, toMoney } from "../decimal-utils";

export const helocSchema = z.object({
  homeValue: numberField({ label: "Home value", min: 1, max: 1_000_000_000 }),
  existingMortgageBalance: numberField({ label: "Existing mortgage balance", min: 0, max: 1_000_000_000 }),
  creditLimitPercent: numberField({ label: "Max combined loan-to-value", min: 1, max: 100 }),
  drawAmount: numberField({ label: "Amount drawn", min: 1, max: 1_000_000_000 }),
  interestRate: numberField({ label: "Interest rate", min: 0, max: 100 }),
  repaymentTermYears: numberField({ label: "Repayment term after draw period", min: 0.1, max: 40 }),
});

export type HelocValues = z.infer<typeof helocSchema>;

function calculate(values: HelocValues): CalcResult {
  const homeValue = new Decimal(values.homeValue);
  const existingBalance = new Decimal(values.existingMortgageBalance);
  const drawAmount = new Decimal(values.drawAmount);
  const monthlyRate = new Decimal(values.interestRate).dividedBy(100).dividedBy(12);

  const maxLimit = homeValue.times(new Decimal(values.creditLimitPercent).dividedBy(100)).minus(existingBalance);
  const interestOnlyPayment = drawAmount.times(monthlyRate);

  const repaymentPayments = Math.round(values.repaymentTermYears * 12);
  const repaymentPayment = monthlyPayment(drawAmount, monthlyRate, repaymentPayments);

  return {
    primary: { key: "interestOnlyPayment", label: "Interest-only payment (draw period)", value: toMoney(interestOnlyPayment), format: "currency" },
    secondary: [
      { key: "maxLimit", label: "Maximum available credit line", value: toMoney(Decimal.max(maxLimit, 0)), format: "currency" },
      { key: "repaymentPayment", label: "Principal + interest payment (repayment period)", value: toMoney(repaymentPayment), format: "currency" },
    ],
    notes: drawAmount.greaterThan(maxLimit) ? ["The amount drawn exceeds the estimated maximum credit line at this loan-to-value limit."] : undefined,
  };
}

export const helocCalculator: CalculatorDef = {
  id: "heloc",
  slug: "heloc",
  title: "HELOC Calculator",
  description: "Estimate your available credit line and payments during and after a HELOC's draw period.",
  category: "finance",
  icon: Wallet,
  keywords: ["heloc", "home equity line of credit", "draw period", "interest only"],
  inputs: [
    { name: "homeValue", label: "Home value", kind: "currency", defaultValue: "", required: true },
    { name: "existingMortgageBalance", label: "Existing mortgage balance", kind: "currency", defaultValue: "", required: true },
    { name: "drawAmount", label: "Amount drawn", kind: "currency", defaultValue: "", required: true },
    { name: "interestRate", label: "Interest rate (annual %)", kind: "percentage", defaultValue: "", required: true },
  ],
  advancedInputs: [
    { name: "creditLimitPercent", label: "Max combined loan-to-value (%)", kind: "percentage", defaultValue: "80", required: true },
    { name: "repaymentTermYears", label: "Repayment term after draw period (years)", kind: "number", defaultValue: "10", min: 0.1, max: 40, step: 1, required: true },
  ],
  schema: helocSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  formula: "Draw-period payment = Amount drawn × monthly rate (interest-only). Repayment-period payment uses the standard amortizing loan formula on the drawn balance.",
  explanation: [
    {
      heading: "Two very different phases",
      body: "During the draw period you typically pay interest only, so your balance doesn't shrink. Once repayment begins, you pay both principal and interest — and the payment usually jumps significantly.",
    },
  ],
  faq: [
    { q: "Is the interest rate fixed?", a: "Most HELOCs have a variable rate tied to a benchmark, so actual payments can change over time even if the drawn balance doesn't." },
  ],
  related: ["home-equity-loan", "mortgage", "refinance"],
};
