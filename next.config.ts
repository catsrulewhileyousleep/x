import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Dev-only: lets remote preview hosts load dev assets so client components hydrate.
  allowedDevOrigins: ["127.0.0.1", "*.preview.usehoplite.com"],
};

export default nextConfig;
