import { describe, it, expect } from "vitest";
import { ratioCalculator, ratioSchema } from "./ratio";

function calc(input: Record<string, string>) {
  return ratioCalculator.calculate(ratioSchema.parse(input) as never);
}

describe("ratio calculator", () => {
  it("simplifies a ratio", () => {
    const result = calc({ a: "8", b: "12" });
    expect(result.primary.value).toBe("2:3");
  });

  it("solves a proportion for d", () => {
    const result = calc({ a: "2", b: "3", c: "10" });
    const d = result.secondary.find((s) => s.key === "d");
    // 2:3 = 10:d -> d = 15
    expect(d!.value).toBe(15);
  });
});
