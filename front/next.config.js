const MomentLocalesPlugin = require("moment-locales-webpack-plugin");

module.exports = {
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
