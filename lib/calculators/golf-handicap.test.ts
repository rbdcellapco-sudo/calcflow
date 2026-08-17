import { describe, it, expect } from "vitest";
import { golfHandicapCalculator, golfHandicapSchema } from "./golf-handicap";

function calc(input: Record<string, string>) {
  return golfHandicapCalculator.calculate(golfHandicapSchema.parse(input) as never);
}

describe("golf handicap calculator", () => {
  it("computes a handicap index from one round", () => {
    const result = calc({ score1: "90", rating1: "72", slope1: "113" });
    // (90-72)*113/113=18, *0.96=17.28
    expect(result.primary.value as number).toBeCloseTo(17.3, 1);
  });

  it("uses the best round among multiple entries", () => {
    const result = calc({ score1: "100", rating1: "72", slope1: "113", score2: "85", rating2: "72", slope2: "113" });
    // best differential from round 2: (85-72)=13*0.96=12.48
    expect(result.primary.value as number).toBeCloseTo(12.5, 1);
  });
});
