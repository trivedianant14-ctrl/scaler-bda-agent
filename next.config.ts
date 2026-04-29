import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {},
  webpack: (config) => {
    // PDF.js optionally requires 'canvas' for server-side rendering; stub it out
    // so webpack doesn't error when react-pdf is imported in a client component.
    config.resolve.alias.canvas = false;
    return config;
  },
};

export default nextConfig;
