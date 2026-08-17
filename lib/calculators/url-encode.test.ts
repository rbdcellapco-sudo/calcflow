import { describe, it, expect } from "vitest";
import { urlEncodeCalculator, urlEncodeSchema } from "./url-encode";

function calc(input: Record<string, string>) {
  return urlEncodeCalculator.calculate(urlEncodeSchema.parse(input) as never);
}

describe("url encode calculator", () => {
  it("encodes special characters", () => {
    const result = calc({ mode: "encode", input: "hello world & more" });
    expect(result.primary.value).toBe("hello%20world%20%26%20more");
  });

  it("decodes back to the original text", () => {
    const result = calc({ mode: "decode", input: "hello%20world%20%26%20more" });
    expect(result.primary.value).toBe("hello world & more");
  });
});
