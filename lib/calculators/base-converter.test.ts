import { describe, it, expect } from "vitest";
import { baseConverterCalculator, baseConverterSchema } from "./base-converter";

function calc(input: Record<string, string>) {
  return baseConverterCalculator.calculate(baseConverterSchema.parse(input) as never);
}

describe("base converter calculator", () => {
  it("converts decimal to other bases", () => {
    const result = calc({ fromBase: "10", value: "255" });
    expect(result.primary.value).toBe(255);
    expect(result.secondary.find((s) => s.key === "hex")!.value).toBe("FF");
    expect(result.secondary.find((s) => s.key === "binary")!.value).toBe("11111111");
  });

  it("converts hex to decimal", () => {
    const result = calc({ fromBase: "16", value: "ff" });
    expect(result.primary.value).toBe(255);
  });

  it("rejects invalid digits for the chosen base", () => {
    expect(() => baseConverterSchema.parse({ fromBase: "2", value: "102" })).toThrow();
  });
});
