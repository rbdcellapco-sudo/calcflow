import { Tag } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef, ResultValue } from "../types";
import { numberField } from "../validation";
import { Decimal, toMoney } from "../decimal-utils";

export const discountSchema = z.object({
  originalPrice: numberField({ label: "Original price", min: 0, max: 1_000_000_000 }),
  discountPercent: numberField({ label: "Discount", min: 0, max: 100 }),
  additionalDiscountPercent: numberField({ label: "Additional stacked discount", min: 0, max: 100, required: false }),
});

export type DiscountValues = z.infer<typeof discountSchema>;

function calculate(values: DiscountValues): CalcResult {
  const originalPrice = new Decimal(values.originalPrice);
  const discount = new Decimal(values.discountPercent).dividedBy(100);
  const priceAfterFirstDiscount = originalPrice.times(new Decimal(1).minus(discount));

  const additionalDiscount = new Decimal(values.additionalDiscountPercent ?? 0).dividedBy(100);
  const finalPrice = additionalDiscount.greaterThan(0)
    ? priceAfterFirstDiscount.times(new Decimal(1).minus(additionalDiscount))
    : priceAfterFirstDiscount;

  const amountSaved = originalPrice.minus(finalPrice);
  const effectiveDiscountPercent = originalPrice.isZero() ? new Decimal(0) : amountSaved.dividedBy(originalPrice).times(100);

  const secondary: ResultValue[] = [
    { key: "amountSaved", label: "Amount saved", value: toMoney(amountSaved), format: "currency" },
    { key: "originalPrice", label: "Original price", value: toMoney(originalPrice), format: "currency" },
  ];
  if (additionalDiscount.greaterThan(0)) {
    secondary.push({ key: "effectiveDiscountPercent", label: "Effective total discount", value: Number(effectiveDiscountPercent.toFixed(2)), format: "percentage" });
  }

  return {
    primary: { key: "finalPrice", label: "Final price", value: toMoney(finalPrice), format: "currency" },
    secondary,
  };
}

export const discountCalculator: CalculatorDef = {
  id: "discount",
  slug: "discount",
  title: "Discount Calculator",
  description: "Calculate a discounted price and amount saved, including stacked discounts.",
  category: "finance",
  icon: Tag,
  keywords: ["discount", "percent off", "sale price", "stacked discount"],
  inputs: [
    { name: "originalPrice", label: "Original price", kind: "currency", defaultValue: "", required: true },
    { name: "discountPercent", label: "Discount (%)", kind: "percentage", defaultValue: "", required: true },
  ],
  advancedInputs: [
    { name: "additionalDiscountPercent", label: "Additional stacked discount (%)", kind: "percentage", defaultValue: "0", required: false, helpText: "Applied on top of the first discount, e.g. an extra coupon." },
  ],
  schema: discountSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  formula: "Final price = Original price × (1 − discount). A stacked discount is applied to the already-discounted price, not the original.",
  explanation: [
    {
      heading: "Stacked discounts don't add up",
      body: "Two 20% discounts stacked together don't equal 40% off — the second discount applies to the already-reduced price, so the combined effect is smaller than adding the percentages.",
    },
  ],
  faq: [
    { q: "Why isn't 20% + 10% equal to 30% off?", a: "Because the 10% is taken off the price after the first 20% discount, not off the original price — the combined discount works out to 28%, not 30%." },
  ],
  related: ["sales-tax", "margin", "percentage"],
};
