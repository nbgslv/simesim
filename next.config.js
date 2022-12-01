/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: [
        {
          loader: "@svgr/webpack",
          options: {
            svgoConfig: {
              plugins: [{
                name: 'preset-default',
                params: {
                  overrides: {
                    cleanupIDs: false
                  }
                }
              }]
            }
          }
        }
      ]
    });

    return config;
  },
  images: {
    domains: ['mapsvg.com', 'purecatamphetamine.github.io'],
  },
};

module.exports = nextConfig;
