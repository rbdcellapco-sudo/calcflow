import { describe, it, expect } from "vitest";
import { bigNumberCalculator, bigNumberSchema } from "./big-number";

function calc(input: Record<string, string>) {
  return bigNumberCalculator.calculate(bigNumberSchema.parse(input) as never);
}

describe("big number calculator", () => {
  it("multiplies numbers beyond safe integer precision", () => {
    const result = calc({ num1: "123456789012345678901234567890", operation: "multiply", num2: "2" });
    expect(result.primary.value).toBe("246913578024691357802469135780");
  });

  it("adds large numbers exactly", () => {
    const result = calc({ num1: "999999999999999999999999999999", operation: "add", num2: "1" });
    expect(result.primary.value).toBe("1000000000000000000000000000000");
  });

  it("rejects division by zero", () => {
    expect(() => calc({ num1: "5", operation: "divide", num2: "0" })).toThrow();
  });

  it("rejects invalid number input", () => {
    expect(() => bigNumberSchema.parse({ num1: "abc", operation: "add", num2: "1" })).toThrow();
  });
});
