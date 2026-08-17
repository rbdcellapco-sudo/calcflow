import { describe, it, expect } from "vitest";
import { logCalculator, logSchema } from "./log";

function calc(input: Record<string, string>) {
  return logCalculator.calculate(logSchema.parse(input) as never);
}

describe("log calculator", () => {
  it("computes log base 10", () => {
    const result = calc({ value: "1000", base: "10" });
    expect(result.primary.value).toBe(3);
  });

  it("computes log base 2", () => {
    const result = calc({ value: "8", base: "2" });
    expect(result.primary.value).toBe(3);
  });

  it("rejects a base of 1", () => {
    expect(() => logSchema.parse({ value: "10", base: "1" })).toThrow();
  });
});
