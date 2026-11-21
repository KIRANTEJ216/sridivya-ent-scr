import type { NextConfig } from "next";

// No serverExternalPackages: the three.js runtime it referenced went with the
// CSS-3D box and the R3F scenes, which were both removed.
const nextConfig: NextConfig = {
  // Browsers and crawlers still ask for /favicon.ico; serve the SVG mark.
  async redirects() {
    return [{ source: "/favicon.ico", destination: "/icon.svg", permanent: true }];
  },
};

export default nextConfig;
