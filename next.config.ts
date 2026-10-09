import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the project root so a stray package-lock.json in a parent folder
  // (e.g. the user's home directory) isn't mistaken for the workspace root.
  turbopack: { root: path.resolve(__dirname) },
};

export default nextConfig;
