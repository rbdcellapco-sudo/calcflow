import { describe, it, expect } from "vitest";
import { shoeSizeCalculator, shoeSizeSchema } from "./shoe-size";

function calc(input: Record<string, string>) {
  return shoeSizeCalculator.calculate(shoeSizeSchema.parse(input) as never);
}

describe("shoe size calculator", () => {
  it("computes larger sizes for longer feet", () => {
    const small = calc({ gender: "men", footLengthCm: "24" });
    const large = calc({ gender: "men", footLengthCm: "30" });
    expect(large.primary.value as number).toBeGreaterThan(small.primary.value as number);
  });
});
