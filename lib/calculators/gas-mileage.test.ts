import { describe, it, expect } from "vitest";
import { gasMileageCalculator, gasMileageSchema } from "./gas-mileage";

function calc(input: Record<string, string>) {
  return gasMileageCalculator.calculate(gasMileageSchema.parse(input) as never);
}

describe("gas mileage calculator", () => {
  it("computes mpg", () => {
    const result = calc({ distance: "300", fuelUsed: "10" });
    expect(result.primary.value).toBe(30);
  });

  it("computes cost per mile when price is given", () => {
    const result = calc({ distance: "300", fuelUsed: "10", fuelPrice: "3" });
    const cpm = result.secondary.find((s) => s.key === "costPerMile");
    expect(cpm!.value).toBe(0.1);
  });
});
