/** @type {import('next').NextConfig} */
const nextConfig = {
  // Webpack configuration for non-Turbopack builds
  webpack: (config, { isServer }) => {
    // Fix for fluent-ffmpeg
    config.resolve.alias = {
      ...config.resolve.alias,
      './lib-cov/fluent-ffmpeg': './lib/fluent-ffmpeg',
    };
    
    return config;
  },
  // Add transpilePackages for any problematic packages
  transpilePackages: ['fluent-ffmpeg', 'whatsapp-web.js'],
  
  // Turbopack configuration
  experimental: {
    turbo: {
      resolveAlias: {
        './lib-cov/fluent-ffmpeg': './lib/fluent-ffmpeg',
      },
    },
  },
};

module.exports = nextConfig;
