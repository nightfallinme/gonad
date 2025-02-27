/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.fallback = { 
      fs: false, 
      net: false, 
      tls: false,
      crypto: false,
      stream: false,
      http: false,
      https: false,
      zlib: false,
      os: false,
      path: false,
      assert: false
    };
    return config;
  },
  transpilePackages: [
    '@rainbow-me/rainbowkit',
    '@wagmi/core',
    'wagmi',
    'viem'
  ]
};

module.exports = nextConfig; 