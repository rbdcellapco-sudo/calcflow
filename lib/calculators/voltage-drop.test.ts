import { describe, it, expect } from "vitest";
import { voltageDropCalculator, voltageDropSchema } from "./voltage-drop";

function calc(input: Record<string, string>) {
  return voltageDropCalculator.calculate(voltageDropSchema.parse(input) as never);
}

describe("voltage drop calculator", () => {
  it("computes a larger drop for longer distances", () => {
    const short = calc({ voltage: "120", current: "10", distanceFeet: "50", wireGauge: "12" });
    const long = calc({ voltage: "120", current: "10", distanceFeet: "200", wireGauge: "12" });
    expect(long.primary.value as number).toBeGreaterThan(short.primary.value as number);
  });

  it("flags an excessive percent drop", () => {
    const result = calc({ voltage: "12", current: "10", distanceFeet: "200", wireGauge: "18" });
    expect(result.notes).toBeDefined();
  });
});
