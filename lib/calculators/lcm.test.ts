import { describe, it, expect } from "vitest";
import { lcmCalculator, lcmSchema } from "./lcm";

function calc(input: Record<string, string>) {
  return lcmCalculator.calculate(lcmSchema.parse(input) as never);
}

describe("lcm calculator", () => {
  it("computes lcm of two numbers", () => {
    const result = calc({ a: "4", b: "6" });
    expect(result.primary.value).toBe(12);
  });

  it("computes lcm of three numbers", () => {
    const result = calc({ a: "4", b: "6", c: "8" });
    expect(result.primary.value).toBe(24);
  });
});
