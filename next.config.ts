import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Enable performance optimizations
    optimizePackageImports: ["lucide-react"],
  },
};

export default nextConfig;
