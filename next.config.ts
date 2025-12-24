import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Temporarily disabled to avoid Turbopack issues
  reactCompiler: true,
  // Habilita modo standalone para Docker
  output: "standalone",
};

export default nextConfig;
