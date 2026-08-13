"use client";

import { useEffect, useState } from "react";
import { Bookmark } from "lucide-react";
import { CalculatorCard } from "@/components/home/calculator-card";
import { EmptyState } from "@/components/ui/empty-state";
import { getFavorites } from "@/lib/storage";
import { getCalculatorBySlug } from "@/lib/registry";

export function FavoritesView() {
  const [favorites, setFavorites] = useState<string[] | null>(null);

  useEffect(() => {
    setFavorites(getFavorites());
    const onChange = () => setFavorites(getFavorites());
    window.addEventListener("calcflow:favorites-changed", onChange);
    return () => window.removeEventListener("calcflow:favorites-changed", onChange);
  }, []);

  if (favorites === null) {
    return null;
  }

  if (favorites.length === 0) {
    return (
      <EmptyState
        icon={Bookmark}
        title="No favorites yet"
        description="Tap Save on any calculator's result to pin it here for quick access."
      />
    );
  }

  const defs = favorites.map((slug) => getCalculatorBySlug(slug)).filter((d): d is NonNullable<typeof d> => Boolean(d));

  return (
    <div className="flex flex-col gap-2">
      {defs.map((def) => (
        <CalculatorCard key={def.slug} def={def} />
      ))}
    </div>
  );
}
