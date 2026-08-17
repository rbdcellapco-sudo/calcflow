import { describe, it, expect } from "vitest";
import { bandwidthCalculator, bandwidthSchema } from "./bandwidth";

function calc(input: Record<string, string>) {
  return bandwidthCalculator.calculate(bandwidthSchema.parse(input) as never);
}

describe("bandwidth calculator", () => {
  it("computes transfer time", () => {
    const result = calc({ fileSize: "1", sizeUnit: "GB", connectionSpeed: "100", speedUnit: "Mbps" });
    // 1GB = 8e9 bits / 100e6 bps = 80s
    const totalSeconds = result.secondary.find((s) => s.key === "totalSeconds");
    expect(totalSeconds!.value).toBe(80);
    expect(result.primary.value).toBe("1m 20s");
  });
});
