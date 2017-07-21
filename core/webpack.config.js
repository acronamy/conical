const path = require('path');
const { CheckerPlugin } = require('awesome-typescript-loader')

module.exports = {
  entry: "./src",
  output: {
    path: path.resolve(__dirname, "dist"), // string
    filename: "bundle.js", // string
  },

  module: {
    rules: [
      {
        test: "\.html$",
        use: [
          // apply multiple loaders and options
          "htmllint-loader",
          {
            loader: "html-loader",
            options: {
              /* ... */
            }
          }
        ]
      },
      {
        test: /\.scss$/,
        use: [{
            loader: "style-loader"
        }, {
            loader: "css-loader"
        }, {
            loader: "sass-loader",
            options: {
                includePaths: ["absolute/path/a", "absolute/path/b"]
            }
        }]
      }
    ],
  },

  resolve: {
    modules: [
      "node_modules"
    ],
    extensions: [
      ".js", 
      ".json", 
      ".css", 
      ".ts"
    ],
    alias: {
 
    },
  },
  performance: {
    hints: "warning", // enum
    maxAssetSize: 200000, // int (in bytes),
    maxEntrypointSize: 400000, // int (in bytes)
    assetFilter: function(assetFilename) {
      // Function predicate that provides asset filenames
      return assetFilename.endsWith('.css') || assetFilename.endsWith('.js');
    }
  },
  devtool: "source-map",
  context: __dirname,
  target: "web",
  externals: [],
  stats: "errors-only",
  plugins: [

  ]
}