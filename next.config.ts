import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure server-only env vars are never included in the client bundle
  serverExternalPackages: [],
};

export default nextConfig;
