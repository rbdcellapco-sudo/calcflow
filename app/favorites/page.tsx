import type { Metadata } from "next";
import { FavoritesView } from "@/components/favorites/favorites-view";

export const metadata: Metadata = {
  title: "Favorites",
  description: "Your saved calculators.",
};

export default function FavoritesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-text">Favorites</h1>
        <p className="text-sm text-text-secondary mt-1">Calculators you've saved for quick access.</p>
      </div>
      <FavoritesView />
    </div>
  );
}
