import { describe, it, expect } from "vitest";
import { percentErrorCalculator, percentErrorSchema } from "./percent-error";

function calc(input: Record<string, string>) {
  return percentErrorCalculator.calculate(percentErrorSchema.parse(input) as never);
}

describe("percent error calculator", () => {
  it("computes percent error", () => {
    const result = calc({ experimentalValue: "48", theoreticalValue: "50" });
    expect(result.primary.value).toBeCloseTo(4, 5);
  });

  it("signed error is negative when experimental is below theoretical", () => {
    const result = calc({ experimentalValue: "48", theoreticalValue: "50" });
    const signed = result.secondary.find((s) => s.key === "signedError");
    expect(signed!.value as number).toBeLessThan(0);
  });

  it("rejects a zero theoretical value", () => {
    expect(() => calc({ experimentalValue: "5", theoreticalValue: "0" })).toThrow();
  });
});
