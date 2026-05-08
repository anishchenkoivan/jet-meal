import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const turbopackRoot = path.join(dirname, "../../");

const nextConfig: NextConfig = {
  transpilePackages: ["@jet-meal/ui-lib"],
  allowedDevOrigins: [
    "127.0.0.1",
    "localhost",
    "dev.jet.meal",
    "10.0.2.2",
  ],
  turbopack: {
    root: turbopackRoot,
  },
};

export default nextConfig;
