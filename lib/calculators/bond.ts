import { ScrollText } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef } from "../types";
import { numberField, selectField } from "../validation";
import { Decimal, toMoney, toRounded } from "../decimal-utils";

const FREQUENCIES = ["annual", "semiannual"] as const;
const PERIODS_PER_YEAR: Record<(typeof FREQUENCIES)[number], number> = { annual: 1, semiannual: 2 };

export const bondSchema = z.object({
  faceValue: numberField({ label: "Face value", min: 0.01, max: 1_000_000_000 }),
  couponRate: numberField({ label: "Annual coupon rate", min: 0, max: 100 }),
  yearsToMaturity: numberField({ label: "Years to maturity", min: 0.1, max: 100 }),
  marketPrice: numberField({ label: "Current market price", min: 0.01, max: 1_000_000_000 }),
  paymentsPerYear: selectField(FREQUENCIES, "Coupon frequency"),
});

export type BondValues = z.infer<typeof bondSchema>;

function priceForYield(faceValue: number, couponPerPeriod: number, periodicYield: number, totalPeriods: number): number {
  if (periodicYield === 0) return couponPerPeriod * totalPeriods + faceValue;
  const discountFactor = Math.pow(1 + periodicYield, -totalPeriods);
  const couponsPV = couponPerPeriod * ((1 - discountFactor) / periodicYield);
  const faceValuePV = faceValue * discountFactor;
  return couponsPV + faceValuePV;
}

function calculate(values: BondValues): CalcResult {
  const faceValue = new Decimal(values.faceValue);
  const couponRate = new Decimal(values.couponRate).dividedBy(100);
  const n = PERIODS_PER_YEAR[values.paymentsPerYear];
  const couponPerPeriod = faceValue.times(couponRate).dividedBy(n);
  const totalPeriods = Math.round(values.yearsToMaturity * n);
  const marketPrice = new Decimal(values.marketPrice);

  const annualCoupon = faceValue.times(couponRate);
  const currentYield = annualCoupon.dividedBy(marketPrice).times(100);

  // Bisect for the periodic yield that prices the bond at the given market price.
  let lo = -0.5;
  let hi = 2;
  for (let i = 0; i < 100; i++) {
    const mid = (lo + hi) / 2;
    const price = priceForYield(faceValue.toNumber(), couponPerPeriod.toNumber(), mid, totalPeriods);
    if (price > marketPrice.toNumber()) {
      lo = mid;
    } else {
      hi = mid;
    }
  }
  const ytm = new Decimal(((lo + hi) / 2) * n * 100);

  return {
    primary: { key: "ytm", label: "Yield to maturity (YTM)", value: toRounded(ytm, 3), format: "percentage" },
    secondary: [
      { key: "currentYield", label: "Current yield", value: toRounded(currentYield), format: "percentage" },
      { key: "annualCoupon", label: "Annual coupon payment", value: toMoney(annualCoupon), format: "currency" },
      { key: "couponPerPeriod", label: "Coupon per payment", value: toMoney(couponPerPeriod), format: "currency" },
    ],
  };
}

export const bondCalculator: CalculatorDef = {
  id: "bond",
  slug: "bond",
  title: "Bond Calculator",
  description: "Calculate a bond's current yield and yield to maturity (YTM).",
  category: "finance",
  icon: ScrollText,
  keywords: ["bond", "yield to maturity", "ytm", "current yield", "coupon rate"],
  inputs: [
    { name: "faceValue", label: "Face value", kind: "currency", defaultValue: "1000", required: true },
    { name: "couponRate", label: "Annual coupon rate (%)", kind: "percentage", defaultValue: "", required: true },
    { name: "marketPrice", label: "Current market price", kind: "currency", defaultValue: "", required: true },
    { name: "yearsToMaturity", label: "Years to maturity", kind: "number", defaultValue: "10", min: 0.1, max: 100, step: 0.5, required: true },
  ],
  advancedInputs: [
    {
      name: "paymentsPerYear",
      label: "Coupon frequency",
      kind: "select",
      defaultValue: "semiannual",
      options: [
        { value: "annual", label: "Annual" },
        { value: "semiannual", label: "Semiannual" },
      ],
    },
  ],
  schema: bondSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  formula: "Current yield = Annual coupon ÷ Market price. YTM is the discount rate that makes the present value of all coupons plus face value equal the market price, solved numerically.",
  explanation: [
    {
      heading: "Why YTM differs from the coupon rate",
      body: "If a bond trades below face value, YTM is higher than the coupon rate, since you're effectively buying future cash flows at a discount. Above face value, the opposite is true.",
    },
  ],
  faq: [
    { q: "What's the difference between current yield and YTM?", a: "Current yield only looks at annual income versus price. YTM also accounts for any gain or loss when the bond matures at face value." },
  ],
  related: ["present-value", "cd", "mutual-fund"],
};
