import { describe, it, expect } from "vitest";
import { roofingCalculator, roofingSchema } from "./roofing";

function calc(input: Record<string, string>) {
  return roofingCalculator.calculate(roofingSchema.parse(input) as never);
}

describe("roofing calculator", () => {
  it("computes more roofing squares for steeper pitch", () => {
    const flat = calc({ length: "40", width: "30", pitch: "0" });
    const steep = calc({ length: "40", width: "30", pitch: "12" });
    expect(steep.primary.value as number).toBeGreaterThan(flat.primary.value as number);
  });

  it("flat roof area roughly equals the footprint plus waste", () => {
    const result = calc({ length: "40", width: "30", pitch: "0", wastePercent: "0" });
    const footprint = result.secondary.find((s) => s.key === "footprintSqFt")!.value as number;
    expect(footprint).toBe(1200);
  });
});
