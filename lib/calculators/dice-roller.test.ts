import { describe, it, expect } from "vitest";
import { diceRollerCalculator, diceRollerSchema } from "./dice-roller";

function calc(input: Record<string, string>) {
  return diceRollerCalculator.calculate(diceRollerSchema.parse(input) as never);
}

describe("dice roller", () => {
  it("rolls the requested number of dice within range", () => {
    const result = calc({ numDice: "5", sides: "6" });
    const rolls = (result.secondary.find((s) => s.key === "rolls")!.value as string).split(", ").map(Number);
    expect(rolls).toHaveLength(5);
    for (const r of rolls) {
      expect(r).toBeGreaterThanOrEqual(1);
      expect(r).toBeLessThanOrEqual(6);
    }
  });

  it("total equals the sum of individual rolls", () => {
    const result = calc({ numDice: "3", sides: "6" });
    const rolls = (result.secondary.find((s) => s.key === "rolls")!.value as string).split(", ").map(Number);
    const sum = rolls.reduce((a, b) => a + b, 0);
    expect(result.primary.value).toBe(sum);
  });
});
