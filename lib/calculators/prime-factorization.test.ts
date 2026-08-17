import { describe, it, expect } from "vitest";
import { primeFactorizationCalculator, primeFactorizationSchema } from "./prime-factorization";

function calc(input: Record<string, string>) {
  return primeFactorizationCalculator.calculate(primeFactorizationSchema.parse(input) as never);
}

describe("prime factorization calculator", () => {
  it("factors a composite number", () => {
    const result = calc({ value: "60" });
    expect(result.primary.value).toBe("2^2 × 3 × 5");
  });

  it("identifies a prime number", () => {
    const result = calc({ value: "17" });
    const isPrime = result.secondary.find((s) => s.key === "isPrime");
    expect(isPrime!.value).toBe("Yes");
  });
});
