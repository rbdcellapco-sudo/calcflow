import { describe, it, expect } from "vitest";
import { tileCalculator, tileSchema } from "./tile";

function calc(input: Record<string, string>) {
  return tileCalculator.calculate(tileSchema.parse(input) as never);
}

describe("tile calculator", () => {
  it("computes tiles needed with waste allowance", () => {
    const result = calc({ roomLength: "10", roomWidth: "10", tileLengthIn: "12", tileWidthIn: "12" });
    // 100 sqft / 1 sqft per tile = 100, *1.1 = 110
    expect(result.primary.value).toBe(110);
  });

  it("computes boxes needed when tiles per box is given", () => {
    const result = calc({ roomLength: "10", roomWidth: "10", tileLengthIn: "12", tileWidthIn: "12", tilesPerBox: "10" });
    const boxes = result.secondary.find((s) => s.key === "boxesNeeded");
    expect(boxes!.value).toBe(11);
  });
});
