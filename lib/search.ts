import { allCalculators } from "./calculators";
import type { CalculatorDef } from "./types";

/**
 * Synonym map: phrases users might type that don't literally appear in a
 * calculator's title/description map to extra calculator slugs to boost.
 * "loan payment" -> Loan, Mortgage, Payment...
 */
const SYNONYMS: Record<string, string[]> = {
  "loan payment": ["loan", "mortgage"],
  payment: ["loan", "mortgage"],
  gratuity: ["tip"],
  "how old": ["age"],
  birthday: ["age"],
  "body fat": ["bmi"],
  weight: ["bmi"],
  savings: ["compound-interest"],
  investment: ["compound-interest"],
  interest: ["compound-interest", "loan", "mortgage"],
  house: ["mortgage"],
  home: ["mortgage"],
  "sales tax": ["percentage"],
  discount: ["percentage"],
  trig: ["scientific"],
  sine: ["scientific"],
  calculator: ["scientific"],
};

function subsequenceMatch(haystack: string, needle: string): boolean {
  let i = 0;
  for (let j = 0; j < haystack.length && i < needle.length; j++) {
    if (haystack[j] === needle[i]) i++;
  }
  return i === needle.length;
}

export type SearchResult = {
  calculator: CalculatorDef;
  score: number;
};

export function searchCalculators(query: string, limit = 20): SearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const words = q.split(/\s+/).filter(Boolean);

  const results: SearchResult[] = [];

  for (const calc of allCalculators) {
    const titleLower = calc.title.toLowerCase();
    const haystack = [calc.title, calc.description, calc.category, ...(calc.keywords ?? [])]
      .join(" ")
      .toLowerCase();

    let score = 0;
    let anyWordMatched = false;

    for (const word of words) {
      if (titleLower === word) {
        score += 100;
        anyWordMatched = true;
      } else if (titleLower.startsWith(word)) {
        score += 60;
        anyWordMatched = true;
      } else if (titleLower.includes(word)) {
        score += 35;
        anyWordMatched = true;
      } else if (haystack.includes(word)) {
        score += 18;
        anyWordMatched = true;
      } else if (word.length >= 3 && subsequenceMatch(titleLower, word)) {
        score += 4;
        anyWordMatched = true;
      }
    }

    // synonym boosts - check whole-query and per-word synonym keys
    for (const [phrase, slugs] of Object.entries(SYNONYMS)) {
      if (q.includes(phrase) && slugs.includes(calc.slug)) {
        score += 80;
        anyWordMatched = true;
      }
    }

    if (anyWordMatched && score > 0) {
      results.push({ calculator: calc, score });
    }
  }

  results.sort((a, b) => b.score - a.score || a.calculator.title.localeCompare(b.calculator.title));
  return results.slice(0, limit);
}
