import type { Metadata } from "next";
import { SearchView } from "@/components/search/search-view";

export const metadata: Metadata = {
  title: "Search",
  description: "Search all CalcFlow calculators.",
};

export default function SearchPage() {
  return (
    <div className="flex flex-col gap-4 -mt-1">
      <h1 className="sr-only">Search calculators</h1>
      <SearchView />
    </div>
  );
}
