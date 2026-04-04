import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
  openAnalyzer: false,
});

const nextConfig: NextConfig = {
  // Temporarily disabled to avoid Turbopack issues
  reactCompiler: true,
  // Habilita modo standalone para Docker
  output: "standalone",
};

export default withBundleAnalyzer(nextConfig);
