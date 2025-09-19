/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    // Enable root -> /api/rpc rewrite only if explicitly opted-in
    if (process.env.ROOT_RPC_REWRITE === 'true') {
      return [
        { source: '/', destination: '/api/rpc' },
      ];
    }
    return [];
  },
};

module.exports = nextConfig;
