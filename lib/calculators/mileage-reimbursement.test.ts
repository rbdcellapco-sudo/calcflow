import { describe, it, expect } from "vitest";
import { mileageReimbursementCalculator, mileageReimbursementSchema } from "./mileage-reimbursement";

function calc(input: Record<string, string>) {
  return mileageReimbursementCalculator.calculate(mileageReimbursementSchema.parse(input) as never);
}

describe("mileage reimbursement calculator", () => {
  it("computes total reimbursement", () => {
    const result = calc({ miles: "100", ratePerMile: "0.67" });
    expect(result.primary.value).toBe(67);
  });
});
