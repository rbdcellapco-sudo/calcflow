import { SearchEntry } from "@/components/home/search-entry";
import { CategoryCard } from "@/components/home/category-card";
import { CalculatorCard } from "@/components/home/calculator-card";
import { RecentCalculators } from "@/components/home/recent-calculators";
import { categories } from "@/lib/categories";
import { allCalculators, getCalculatorsByCategory } from "@/lib/registry";

export default function HomePage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-text">Every calculation. One simple app.</h1>
        <p className="text-sm text-text-secondary">
          {allCalculators.length} calculators covering finance, health, math, dates, and more - no login, works
          offline.
        </p>
      </div>

      <SearchEntry />

      <RecentCalculators />

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-text-secondary">Categories</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {categories.map((c) => (
            <CategoryCard key={c.id} category={c} count={getCalculatorsByCategory(c.id).length} />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-text-secondary">All calculators</h2>
        <div className="flex flex-col gap-2">
          {allCalculators.map((def) => (
            <CalculatorCard key={def.slug} def={def} />
          ))}
        </div>
      </section>
    </div>
  );
}
