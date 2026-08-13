import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CalcFlow — Every calculation. One simple app.",
    short_name: "CalcFlow",
    description:
      "A fast, installable calculator super-app with mortgage, loan, BMI, percentage, scientific, and more calculators. No login, works offline.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f6f7f9",
    theme_color: "#0d6e6e",
    orientation: "portrait-primary",
    categories: ["utilities", "finance", "productivity"],
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
