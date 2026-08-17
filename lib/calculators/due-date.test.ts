import { describe, it, expect } from "vitest";
import { dueDateCalculator, dueDateSchema } from "./due-date";

function calc(input: Record<string, string>) {
  return dueDateCalculator.calculate(dueDateSchema.parse(input) as never);
}

describe("due date calculator", () => {
  it("computes a due date 280 days from the last period", () => {
    const result = calc({ mode: "lmp", date: "2025-01-01", cycleLength: "28" });
    expect(result.primary.value).toBe("October 8, 2025");
  });

  it("computes a due date 266 days from conception", () => {
    const result = calc({ mode: "conception", date: "2025-01-01" });
    expect(result.primary.value).toBe("September 24, 2025");
  });

  it("rejects a future date", () => {
    expect(() => dueDateSchema.parse({ mode: "lmp", date: "2099-01-01", cycleLength: "28" })).toThrow();
  });
});
