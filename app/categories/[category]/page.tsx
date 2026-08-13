import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CalculatorCard } from "@/components/home/calculator-card";
import { categories, categoryMap } from "@/lib/categories";
import { getCalculatorsByCategory } from "@/lib/registry";
import type { CategoryId } from "@/lib/types";

export function generateStaticParams() {
  return categories.map((c) => ({ category: c.id }));
}

function isCategoryId(value: string): value is CategoryId {
  return categories.some((c) => c.id === value);
}

export async function generateMetadata(props: PageProps<"/categories/[category]">): Promise<Metadata> {
  const { category } = await props.params;
  if (!isCategoryId(category)) return {};
  const meta = categoryMap[category];
  return { title: meta.label, description: meta.description };
}

export default async function CategoryPage(props: PageProps<"/categories/[category]">) {
  const { category } = await props.params;
  if (!isCategoryId(category)) notFound();

  const meta = categoryMap[category];
  const items = getCalculatorsByCategory(category);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-text">{meta.label}</h1>
        <p className="text-sm text-text-secondary mt-1">{meta.description}</p>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-text-secondary">No calculators in this category yet - more are on the way.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((def) => (
            <CalculatorCard key={def.slug} def={def} />
          ))}
        </div>
      )}
    </div>
  );
}
