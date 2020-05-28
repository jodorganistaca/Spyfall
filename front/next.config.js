const withPlugins = require("next-compose-plugins");
const optimizedImages = require("next-optimized-images");
const MomentLocalesPlugin = require("moment-locales-webpack-plugin");

const nextConfig = {
  webpack: (config) => {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });

    config.plugins.push(
      new MomentLocalesPlugin({
        localesToKeep: ["es-us", "en", "de"],
      })
    );
    return config;
  },
};

module.exports = withPlugins([
  [
    optimizedImages,
    {
      /* config for next-optimized-images */
    },
  ],
  nextConfig,
]);
