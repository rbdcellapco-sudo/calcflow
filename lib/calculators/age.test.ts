import { describe, it, expect } from "vitest";
import { ageCalculator, ageSchema } from "./age";

function calc(input: Record<string, string>) {
  return ageCalculator.calculate(ageSchema.parse(input) as never);
}

describe("age calculator", () => {
  it("computes a simple whole-year age", () => {
    const result = calc({ birthDate: "2000-01-01", asOfDate: "2024-01-01" });
    const years = result.secondary.find((s) => s.key === "years")!;
    expect(years.value).toBe(24);
  });

  it("handles a leap year birthday (Feb 29)", () => {
    const result = calc({ birthDate: "2000-02-29", asOfDate: "2024-02-29" });
    const years = result.secondary.find((s) => s.key === "years")!;
    expect(years.value).toBe(24);
  });

  it("correctly counts a leap-day birthday in a non-leap year as not yet reached", () => {
    // 2000-02-29 birthday, checked on 2023-02-28 (2023 is not a leap year)
    const result = calc({ birthDate: "2000-02-29", asOfDate: "2023-02-28" });
    const years = result.secondary.find((s) => s.key === "years")!;
    expect(years.value).toBe(22);
  });

  it("handles month boundaries correctly (birthday not yet reached this year)", () => {
    const result = calc({ birthDate: "1990-12-25", asOfDate: "2024-01-01" });
    const years = result.secondary.find((s) => s.key === "years")!;
    expect(years.value).toBe(33);
  });

  it("computes total days across a known range", () => {
    const result = calc({ birthDate: "2024-01-01", asOfDate: "2024-01-31" });
    const totalDays = result.secondary.find((s) => s.key === "totalDays")!;
    expect(totalDays.value).toBe(30);
  });

  it("rejects a birth date after the reference date", () => {
    expect(() => ageSchema.parse({ birthDate: "2030-01-01", asOfDate: "2024-01-01" })).toThrow();
  });

  it("rejects an invalid date string", () => {
    expect(() => ageSchema.parse({ birthDate: "not-a-date", asOfDate: "2024-01-01" })).toThrow();
  });
});
