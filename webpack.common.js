const path = require("path");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

module.exports = {
  entry: {
    application: path.resolve(
      __dirname,
      "src/app/assets/javascripts/application.js"
    ),
    // react: path.resolve(__dirname, "src/app/assets/javascripts/react.js")
  },
  output: {
    filename: "[name].bundle.js",
    path: path.join(__dirname, "public/javascripts")
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: "babel-loader"
        }
      }
    ]
  },
  resolve: {
    modules: ["node_modules"],
    extensions: [".js", ".json", ".jsx"]
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        commons: {
          name: "vendor",
          test: /[\\/]node_modules[\\/]/,
          minChunks: 2
        }
      }
    }
  }
};
