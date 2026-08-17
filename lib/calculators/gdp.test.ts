import { describe, it, expect } from "vitest";
import { gdpCalculator, gdpSchema } from "./gdp";

function calc(input: Record<string, string>) {
  return gdpCalculator.calculate(gdpSchema.parse(input) as never);
}

describe("gdp calculator", () => {
  it("computes GDP via the expenditure approach", () => {
    const result = calc({ consumption: "100", investment: "50", governmentSpending: "30", exports: "20", imports: "10" });
    // 100+50+30+(20-10) = 190
    expect(result.primary.value).toBe(190);
  });

  it("computes GDP per capita when population is given", () => {
    const result = calc({ consumption: "100", investment: "50", governmentSpending: "30", exports: "20", imports: "10", population: "10" });
    const perCapita = result.secondary.find((s) => s.key === "gdpPerCapita");
    expect(perCapita!.value).toBe(19);
  });
});
