import { allCalculators } from "./calculators";
import type { CalculatorDef, CategoryId } from "./types";

export { allCalculators };

const bySlug = new Map<string, CalculatorDef>(allCalculators.map((c) => [c.slug, c]));

export function getCalculatorBySlug(slug: string): CalculatorDef | undefined {
  return bySlug.get(slug);
}

export function getCalculatorsByCategory(category: CategoryId): CalculatorDef[] {
  return allCalculators.filter((c) => c.category === category);
}

export function getRelatedCalculators(def: CalculatorDef): CalculatorDef[] {
  return def.related
    .map((slug) => bySlug.get(slug))
    .filter((c): c is CalculatorDef => Boolean(c));
}

export function getAllSlugs(): string[] {
  return allCalculators.map((c) => c.slug);
}
