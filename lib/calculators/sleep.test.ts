import { describe, it, expect } from "vitest";
import { sleepCalculator, sleepSchema } from "./sleep";

function calc(input: Record<string, string>) {
  return sleepCalculator.calculate(sleepSchema.parse(input) as never);
}

describe("sleep calculator", () => {
  it("computes a bedtime given a wake-up time", () => {
    const result = calc({ mode: "wake-up", time: "07:00", fallAsleepMinutes: "15" });
    // 6 cycles = 540 min + 15 = 555 min before 07:00 => 21:45
    expect(result.primary.value).toBe("21:45");
  });

  it("computes a wake time given a bedtime", () => {
    const result = calc({ mode: "bedtime", time: "22:00", fallAsleepMinutes: "0" });
    // 6 cycles = 540 min after 22:00 = 07:00
    expect(result.primary.value).toBe("07:00");
  });
});
