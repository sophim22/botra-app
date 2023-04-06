const {merge} = require("webpack-merge");
const CompressionPlugin = require("compression-webpack-plugin");
const common = require("./webpack.common.js");
const MinifyPlugin = require("babel-minify-webpack-plugin");

module.exports = merge(
  common,
  {
    mode: "production"
  },

  {
    plugins: [new CompressionPlugin()]
  }
);
