import type { MetadataRoute } from "next";

export const dynamic = "force-static";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CalcFlow — Every calculation. One simple app.",
    short_name: "CalcFlow",
    description:
      "A fast, installable calculator super-app with mortgage, loan, BMI, percentage, scientific, and more calculators. No login, works offline.",
    start_url: `${basePath}/`,
    scope: `${basePath}/`,
    display: "standalone",
    background_color: "#f7f7fb",
    theme_color: "#5b3df0",
    orientation: "portrait-primary",
    categories: ["utilities", "finance", "productivity"],
    icons: [
      {
        src: `${basePath}/icon.svg`,
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: `${basePath}/icon.svg`,
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
