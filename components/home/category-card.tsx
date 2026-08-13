import Link from "next/link";
import type { CategoryMeta } from "@/lib/categories";
import { Card } from "@/components/ui/card";

export function CategoryCard({ category, count }: { category: CategoryMeta; count: number }) {
  const Icon = category.icon;
  return (
    <Link href={`/categories/${category.id}`} className="block h-full">
      <Card className="p-4 sm:p-5 h-full flex flex-col gap-3 hover:border-accent/50 transition-colors duration-150">
        <div className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-sm)] bg-accent-soft text-accent">
          <Icon className="h-5 w-5" aria-hidden />
        </div>
        <div>
          <p className="text-base font-semibold text-text">{category.label}</p>
          <p className="text-xs text-text-secondary mt-0.5">{category.description}</p>
        </div>
        <p className="text-xs font-medium text-text-muted mt-auto">
          {count} {count === 1 ? "calculator" : "calculators"}
        </p>
      </Card>
    </Link>
  );
}
