import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Opt into Next 16's native view transitions. When a Link navigation
  // fires, the router wraps the update in document.startViewTransition,
  // so any element with a CSS `view-transition-name` morphs smoothly
  // between pages instead of hard-swapping.
  experimental: {
    viewTransition: true,
  },
};

export default nextConfig;
