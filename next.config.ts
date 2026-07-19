import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   /* config options here */
// };

// export default nextConfig;
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  output: 'export', // ✅ Force static export
  images: {
    unoptimized: true, // ✅ Required for static export
  },
  trailingSlash: true,
};

module.exports = nextConfig;