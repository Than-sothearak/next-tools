import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },

  allowedDevOrigins: [
    "skilled-jacqulyn-flamier.ngrok-free.dev",
    "*.local-origin.dev",
  ],
};

export default nextConfig;