import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  devIndicators: false,
  allowedDevOrigins: ["192.168.100.32", "localhost:3000"],
};

export default nextConfig;
