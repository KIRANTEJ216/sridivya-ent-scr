import type { NextConfig } from "next";

// No serverExternalPackages: the three.js runtime it referenced went with the
// CSS-3D box and the R3F scenes, which were both removed.
const nextConfig: NextConfig = {};

export default nextConfig;
