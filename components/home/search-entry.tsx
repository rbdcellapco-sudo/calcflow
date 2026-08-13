import Link from "next/link";
import { Search } from "lucide-react";

export function SearchEntry() {
  return (
    <Link
      href="/search"
      className="flex items-center gap-3 min-h-12 w-full rounded-[var(--radius-md)] border border-border bg-surface px-4 text-text-secondary hover:border-accent/50 transition-colors duration-150"
    >
      <Search className="h-5 w-5 shrink-0" aria-hidden />
      <span className="text-[15px]">Search calculators…</span>
    </Link>
  );
}
