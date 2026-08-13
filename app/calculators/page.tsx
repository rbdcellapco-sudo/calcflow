import type { Metadata } from "next";
import { CalculatorCard } from "@/components/home/calculator-card";
import { allCalculators } from "@/lib/registry";
import { categories } from "@/lib/categories";

export const metadata: Metadata = {
  title: "All Calculators",
  description: "Browse every calculator available in CalcFlow.",
};

export default function AllCalculatorsPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-text">All calculators</h1>
        <p className="text-sm text-text-secondary mt-1">{allCalculators.length} calculators and growing.</p>
      </div>

      {categories.map((cat) => {
        const items = allCalculators.filter((c) => c.category === cat.id);
        if (items.length === 0) return null;
        return (
          <section key={cat.id} className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold text-text-secondary">{cat.label}</h2>
            <div className="flex flex-col gap-2">
              {items.map((def) => (
                <CalculatorCard key={def.slug} def={def} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
