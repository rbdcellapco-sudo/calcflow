import type { CalculatorDef } from "../types";
import { percentageCalculator } from "./percentage";
import { tipCalculator } from "./tip";
import { bmiCalculator } from "./bmi";
import { ageCalculator } from "./age";
import { mortgageCalculator } from "./mortgage";
import { loanCalculator } from "./loan";
import { compoundInterestCalculator } from "./compound-interest";
import { scientificCalculator } from "./scientific";

/**
 * Central registry. Adding a new calculator anywhere in the app means
 * creating lib/calculators/<slug>.ts and adding one line here - the shell,
 * search, categories, favorites, and history all pick it up automatically.
 */
export const allCalculators: CalculatorDef[] = [
  percentageCalculator,
  tipCalculator,
  bmiCalculator,
  ageCalculator,
  mortgageCalculator,
  loanCalculator,
  compoundInterestCalculator,
  scientificCalculator,
];
