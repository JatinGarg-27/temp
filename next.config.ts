import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pdf-parse pulls in pdfjs-dist, whose worker script path gets mis-resolved
  // when bundled by Turbopack/webpack. Keep it external so it's loaded
  // natively from node_modules at request time instead.
  serverExternalPackages: ["pdf-parse", "pdfjs-dist"],
};

export default nextConfig;
