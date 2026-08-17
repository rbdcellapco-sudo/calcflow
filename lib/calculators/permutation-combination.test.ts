import { describe, it, expect } from "vitest";
import { permutationCombinationCalculator, permutationCombinationSchema } from "./permutation-combination";

function calc(input: Record<string, string>) {
  return permutationCombinationCalculator.calculate(permutationCombinationSchema.parse(input) as never);
}

describe("permutation and combination calculator", () => {
  it("computes 5C2 and 5P2", () => {
    const result = calc({ n: "5", r: "2" });
    expect(result.primary.value).toBe(10); // 5C2
    const perm = result.secondary.find((s) => s.key === "permutations");
    expect(perm!.value).toBe(20); // 5P2
  });

  it("rejects r greater than n", () => {
    expect(() => permutationCombinationSchema.parse({ n: "3", r: "5" })).toThrow();
  });
});
