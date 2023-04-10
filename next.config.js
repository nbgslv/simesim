/** @type {import('next').NextConfig} */
  // This file sets a custom webpack configuration to use your Next.js app
  // with Sentry.
  // https://nextjs.org/docs/api-reference/next.config.js/introduction
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/

const { withSentryConfig } = require("@sentry/nextjs");

const nextConfig = {
  experimental: {
    scrollRestoration: true,
  },
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
  sentry: {
    hideSourceMaps: true,
    widenClientFileUpload: true,
    debug: true,
  },
  webpack(config) {
    config.experiments = config.experiments || {};
    config.experiments.topLevelAwait = true;

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
      ],
    });

    config.module.rules.push({
      test: /\.html$/i,
      loader: "html-loader",
    });

    return config;
  },
  images: {
    domains: ['mapsvg.com', 'purecatamphetamine.github.io', 'simesim-staging.fra1.digitaloceanspaces.com'],
  },
};

const sentryWebpackPluginOptions = {
  // Additional config options for the Sentry Webpack plugin. Keep in mind that
  // the following options are set automatically, and overriding them is not
  // recommended:
  //   release, url, org, project, authToken, configFile, stripPrefix,
  //   urlPrefix, include, ignore

  silent: true, // Suppresses all logs
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options.
};

module.exports = withSentryConfig(nextConfig, sentryWebpackPluginOptions);
