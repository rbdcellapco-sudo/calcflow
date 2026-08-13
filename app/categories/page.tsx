import type { Metadata } from "next";
import { CategoryCard } from "@/components/home/category-card";
import { categories } from "@/lib/categories";
import { getCalculatorsByCategory } from "@/lib/registry";

export const metadata: Metadata = {
  title: "Categories",
  description: "Browse CalcFlow calculators by category.",
};

export default function CategoriesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-text">Categories</h1>
        <p className="text-sm text-text-secondary mt-1">Find calculators grouped by topic.</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {categories.map((c) => (
          <CategoryCard key={c.id} category={c} count={getCalculatorsByCategory(c.id).length} />
        ))}
      </div>
    </div>
  );
}
