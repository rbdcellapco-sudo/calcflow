import { Landmark } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef } from "../types";
import { numberField } from "../validation";
import { Decimal, toMoney } from "../decimal-utils";

export const cdSchema = z.object({
  deposit: numberField({ label: "Deposit amount", min: 0, max: 1_000_000_000 }),
  apy: numberField({ label: "Annual percentage yield", min: 0, max: 100 }),
  termMonths: numberField({ label: "Term (months)", min: 1, max: 360 }),
  earlyWithdrawalPenaltyMonths: numberField({ label: "Early withdrawal penalty (months of interest)", min: 0, max: 60, required: false }),
});

export type CdValues = z.infer<typeof cdSchema>;

function calculate(values: CdValues): CalcResult {
  const deposit = new Decimal(values.deposit);
  const apy = new Decimal(values.apy).dividedBy(100);
  const years = new Decimal(values.termMonths).dividedBy(12);

  const maturityValue = deposit.times(apy.plus(1).pow(years));
  const interestEarned = maturityValue.minus(deposit);

  const secondary = [
    { key: "deposit", label: "Deposit amount", value: toMoney(deposit), format: "currency" as const },
    { key: "interestEarned", label: "Interest earned", value: toMoney(interestEarned), format: "currency" as const },
  ];

  const penaltyMonths = values.earlyWithdrawalPenaltyMonths ?? 0;
  if (penaltyMonths > 0) {
    const penalty = deposit.times(apy).times(new Decimal(penaltyMonths).dividedBy(12));
    const netIfEarlyWithdrawal = maturityValue.minus(penalty);
    secondary.push({ key: "penalty", label: `Penalty (${penaltyMonths} months' interest)`, value: toMoney(penalty), format: "currency" as const });
    secondary.push({ key: "netIfEarlyWithdrawal", label: "Value if withdrawn early", value: toMoney(netIfEarlyWithdrawal), format: "currency" as const });
  }

  return {
    primary: { key: "maturityValue", label: "Value at maturity", value: toMoney(maturityValue), format: "currency" },
    secondary,
  };
}

export const cdCalculator: CalculatorDef = {
  id: "cd",
  slug: "cd",
  title: "CD Calculator",
  description: "Calculate the maturity value and interest earned on a certificate of deposit.",
  category: "finance",
  icon: Landmark,
  keywords: ["certificate of deposit", "cd rate", "term deposit", "fixed deposit"],
  inputs: [
    { name: "deposit", label: "Deposit amount", kind: "currency", defaultValue: "", required: true },
    { name: "apy", label: "Annual percentage yield (%)", kind: "percentage", defaultValue: "", required: true },
    { name: "termMonths", label: "Term (months)", kind: "number", defaultValue: "12", min: 1, max: 360, step: 1, required: true },
  ],
  advancedInputs: [
    { name: "earlyWithdrawalPenaltyMonths", label: "Early withdrawal penalty (months of interest)", kind: "number", defaultValue: "0", min: 0, max: 60, step: 1, required: false },
  ],
  schema: cdSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  formula: "Maturity value = Deposit × (1 + APY)ᵗ, where t is the term in years.",
  explanation: [
    {
      heading: "Locked-in returns",
      body: "A CD pays a fixed APY for a fixed term. Withdrawing before maturity typically forfeits a set number of months' interest as a penalty.",
    },
  ],
  faq: [
    { q: "What's the difference between APY and interest rate?", a: "APY already accounts for compounding, so it reflects the true annual return, while a stated interest rate alone may not." },
  ],
  related: ["simple-interest", "compound-interest", "savings"],
};
