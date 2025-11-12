import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true
  },
  typescript: {
    ignoreBuildErrors: true
  },
  webpack: (config, { isServer }) => {
    // Ensure crypto libraries are only bundled on server side
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        crypto: false,
        stream: false,
        buffer: false,
      };
    }

    return config;
  },
  // Ensure server-only modules are not bundled in client
  experimental: {
    serverComponentsExternalPackages: [
      '@polkadot/util-crypto',
      '@polkadot/keyring',
    ],
  },
};

export default nextConfig;
