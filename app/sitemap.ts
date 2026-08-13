import type { MetadataRoute } from "next";
import { getAllSlugs } from "@/lib/registry";
import { categories } from "@/lib/categories";

const BASE_URL = "https://calcflow.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE_URL}/calculators`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/categories`, changeFrequency: "monthly", priority: 0.6 },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${BASE_URL}/categories/${c.id}`,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const calculatorRoutes: MetadataRoute.Sitemap = getAllSlugs().map((slug) => ({
    url: `${BASE_URL}/calculators/${slug}`,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...categoryRoutes, ...calculatorRoutes];
}
