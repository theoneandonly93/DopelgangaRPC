/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // appDir is default in recent Next versions; include here for clarity
    appDir: true,
  },
};

module.exports = nextConfig;
