import { describe, it, expect } from "vitest";
import { gcfCalculator, gcfSchema } from "./gcf";

function calc(input: Record<string, string>) {
  return gcfCalculator.calculate(gcfSchema.parse(input) as never);
}

describe("gcf calculator", () => {
  it("computes gcf of two numbers", () => {
    const result = calc({ a: "12", b: "18" });
    expect(result.primary.value).toBe(6);
  });

  it("computes gcf of coprime numbers as 1", () => {
    const result = calc({ a: "7", b: "13" });
    expect(result.primary.value).toBe(1);
  });
});
