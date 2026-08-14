import type { NextConfig } from "next";

// Set by the GitHub Pages workflow to the repo name (e.g. "/calcflow") since
// project pages are served from a sub-path, not the domain root.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  ...(basePath ? { basePath, assetPrefix: `${basePath}/` } : {}),
};

export default nextConfig;
