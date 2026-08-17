import { describe, it, expect } from "vitest";
import { base64Calculator, base64Schema } from "./base64";

function calc(input: Record<string, string>) {
  return base64Calculator.calculate(base64Schema.parse(input) as never);
}

describe("base64 calculator", () => {
  it("encodes text to base64", () => {
    const result = calc({ mode: "encode", input: "Hello, World!" });
    expect(result.primary.value).toBe("SGVsbG8sIFdvcmxkIQ==");
  });

  it("decodes base64 back to text", () => {
    const result = calc({ mode: "decode", input: "SGVsbG8sIFdvcmxkIQ==" });
    expect(result.primary.value).toBe("Hello, World!");
  });

  it("rejects invalid base64 when decoding", () => {
    expect(() => calc({ mode: "decode", input: "not valid base64!!!" })).toThrow();
  });
});
