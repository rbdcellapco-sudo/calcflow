import { describe, it, expect } from "vitest";
import { hoursCalculator, hoursSchema } from "./hours";

const DEFAULTS = { day2In: "", day2Out: "", day3In: "", day3Out: "" };

function calc(input: Record<string, string>) {
  return hoursCalculator.calculate(hoursSchema.parse({ ...DEFAULTS, ...input }) as never);
}

describe("hours calculator", () => {
  it("computes hours worked for a single day", () => {
    const result = calc({ day1In: "09:00", day1Out: "17:00" });
    expect(result.primary.value).toBe(8);
  });

  it("subtracts break time", () => {
    const result = calc({ day1In: "09:00", day1Out: "17:00", breakMinutes: "30" });
    expect(result.primary.value).toBe(7.5);
  });

  it("sums multiple days", () => {
    const result = calc({ day1In: "09:00", day1Out: "17:00", day2In: "09:00", day2Out: "13:00" });
    expect(result.primary.value).toBe(12);
  });

  it("computes pay when an hourly rate is given", () => {
    const result = calc({ day1In: "09:00", day1Out: "17:00", hourlyRate: "20" });
    const pay = result.secondary.find((s) => s.key === "pay");
    expect(pay!.value).toBe(160);
  });

  it("rejects an invalid time format", () => {
    expect(() => hoursSchema.parse({ ...DEFAULTS, day1In: "9am", day1Out: "17:00" })).toThrow();
  });
});
