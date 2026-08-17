import { describe, it, expect } from "vitest";
import { passwordGeneratorCalculator, passwordGeneratorSchema } from "./password-generator";

function calc(input: Record<string, string>) {
  return passwordGeneratorCalculator.calculate(passwordGeneratorSchema.parse(input) as never);
}

describe("password generator", () => {
  it("generates a password of the requested length", () => {
    const result = calc({ length: "20", includeUppercase: "true", includeLowercase: "true", includeNumbers: "true", includeSymbols: "false" });
    expect((result.primary.value as string).length).toBe(20);
  });

  it("throws when no character types are selected", () => {
    expect(() =>
      passwordGeneratorCalculator.calculate(
        passwordGeneratorSchema.parse({ length: "10", includeUppercase: "false", includeLowercase: "false", includeNumbers: "false", includeSymbols: "false" }) as never
      )
    ).toThrow();
  });
});
