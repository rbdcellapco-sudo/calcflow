import { describe, it, expect } from "vitest";
import { resistorCalculator, resistorSchema } from "./resistor";

function calc(input: Record<string, string>) {
  return resistorCalculator.calculate(resistorSchema.parse(input) as never);
}

describe("resistor calculator", () => {
  it("decodes brown-black-red-gold as 1kΩ", () => {
    const result = calc({ band1: "brown", band2: "black", multiplier: "red", tolerance: "gold" });
    expect(result.primary.value).toBe("1 kΩ");
    const tolerance = result.secondary.find((s) => s.key === "tolerance");
    expect(tolerance!.value).toBe("±5%");
  });
});
