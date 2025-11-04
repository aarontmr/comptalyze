import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    // Autoriser des query strings de type ?v=... sur le logo local
    localPatterns: [
      {
        pathname: "/logo.png",
        search: "?v=*",
      },
      {
        pathname: "/previews/**",
      },
    ],
  },
};

export default nextConfig;
