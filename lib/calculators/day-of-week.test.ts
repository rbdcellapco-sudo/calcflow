import { describe, it, expect } from "vitest";
import { dayOfWeekCalculator, dayOfWeekSchema } from "./day-of-week";

function calc(input: Record<string, string>) {
  return dayOfWeekCalculator.calculate(dayOfWeekSchema.parse(input) as never);
}

describe("day of the week calculator", () => {
  it("identifies a known weekday", () => {
    // January 1, 2025 is a Wednesday
    const result = calc({ date: "2025-01-01" });
    expect(result.primary.value).toBe("Wednesday");
  });
});
