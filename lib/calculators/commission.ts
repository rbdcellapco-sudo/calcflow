import { Handshake } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef } from "../types";
import { numberField } from "../validation";
import { Decimal, toMoney } from "../decimal-utils";

export const commissionSchema = z
  .object({
    saleAmount: numberField({ label: "Sale amount", min: 0, max: 1_000_000_000 }),
    commissionRate: numberField({ label: "Commission rate", min: 0, max: 100 }),
    baseSalary: numberField({ label: "Base salary", min: 0, max: 1_000_000_000, required: false }),
    tieredThreshold: numberField({ label: "Higher-rate threshold", min: 0, max: 1_000_000_000, required: false }),
    tieredRate: numberField({ label: "Rate above threshold", min: 0, max: 100, required: false }),
  })
  .superRefine((data, ctx) => {
    if (data.tieredThreshold !== undefined && data.tieredRate === undefined) {
      ctx.addIssue({ code: "custom", path: ["tieredRate"], message: "Enter a rate to apply above the threshold" });
    }
  });

export type CommissionValues = z.infer<typeof commissionSchema>;

function calculate(values: CommissionValues): CalcResult {
  const sale = new Decimal(values.saleAmount);
  const rate = new Decimal(values.commissionRate).dividedBy(100);
  const base = new Decimal(values.baseSalary ?? 0);

  let commission: Decimal;
  if (values.tieredThreshold !== undefined && values.tieredRate !== undefined) {
    const threshold = new Decimal(values.tieredThreshold);
    const tieredRate = new Decimal(values.tieredRate).dividedBy(100);
    const baseAmount = Decimal.min(sale, threshold);
    const excessAmount = Decimal.max(sale.minus(threshold), 0);
    commission = baseAmount.times(rate).plus(excessAmount.times(tieredRate));
  } else {
    commission = sale.times(rate);
  }

  const totalPay = commission.plus(base);

  return {
    primary: { key: "commission", label: "Commission earned", value: toMoney(commission), format: "currency" },
    secondary: [
      { key: "totalPay", label: "Total pay (commission + base)", value: toMoney(totalPay), format: "currency" },
      { key: "saleAmount", label: "Sale amount", value: toMoney(sale), format: "currency" },
    ],
  };
}

export const commissionCalculator: CalculatorDef = {
  id: "commission",
  slug: "commission",
  title: "Commission Calculator",
  description: "Calculate sales commission, including an optional higher rate above a threshold.",
  category: "finance",
  icon: Handshake,
  keywords: ["commission", "sales commission", "tiered commission", "commission rate"],
  inputs: [
    { name: "saleAmount", label: "Sale amount", kind: "currency", defaultValue: "", required: true },
    { name: "commissionRate", label: "Commission rate (%)", kind: "percentage", defaultValue: "", required: true },
  ],
  advancedInputs: [
    { name: "baseSalary", label: "Base salary (added to commission)", kind: "currency", defaultValue: "0", required: false },
    { name: "tieredThreshold", label: "Higher-rate threshold (optional)", kind: "currency", defaultValue: "", required: false },
    { name: "tieredRate", label: "Rate above threshold (%)", kind: "percentage", defaultValue: "", required: false },
  ],
  schema: commissionSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  formula: "Commission = Sale amount × rate. With a tiered threshold, sales above the threshold earn the higher rate on just the excess amount.",
  explanation: [
    {
      heading: "Tiered commission structures",
      body: "Many sales roles pay a higher rate once you exceed a quota or threshold — this calculator applies that higher rate only to the amount above the threshold, not the whole sale.",
    },
  ],
  faq: [
    { q: "Do I need the tiered fields?", a: "No — leave them blank for a simple flat-rate commission calculation." },
  ],
  related: ["salary", "margin", "budget"],
};
