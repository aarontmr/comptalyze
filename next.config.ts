import type { NextConfig } from "next";
import createMDX from '@next/mdx';

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md', 'mdx'],
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

const withMDX = createMDX({
  extension: /\.mdx?$/,
});

export default withMDX(nextConfig);
