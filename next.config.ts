import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   /* config options here */
// };

// export default nextConfig;
// next.config.js
// /** @type {import('next').NextConfig} */
// const nextConfig: NextConfig = {
//   output: 'export', // ✅ Force static export
//   images: {
//     unoptimized: true, // ✅ Required for static export
//   },
//   trailingSlash: true,
// };

// module.exports = nextConfig;

// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  distDir: 'out', // Optional: ensure output is in 'out'
  reactStrictMode: true,
  swcMinify: true,
};

module.exports = nextConfig;