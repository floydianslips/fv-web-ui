var path = require("path")
var webpack = require("webpack")
var webpackManifest = require("../lib/webpackManifest")

var WriteFilePlugin = require("write-file-webpack-plugin")
var UglifyJsPlugin = require("uglifyjs-webpack-plugin")
var HappyPack = require("happypack")
var config = require("./")

// Phaser webpack config , requried by fv-games
const phaserModule = path.resolve("./node_modules/phaser-ce/")
const phaser = path.join(phaserModule, "build/custom/phaser-split.js")
const pixi = path.join(phaserModule, "build/custom/pixi.js")
const p2 = path.join(phaserModule, "build/custom/p2.js")

module.exports = function(env) {
  var port = 3001

  var jsSourceDirectory = config.sourceAssets + config.javascriptDirectory + "/"
  var stylesSourceDirectory = config.sourceAssets + config.stylesheetsDirectory + "/"
  var gamesSourceDirectory = config.sourceAssets + config.gamesDirectory + "/"

  var absPublicDirectory = path.resolve(config.publicDirectory)
  var absPublicAssetsDirectory = path.resolve(config.publicAssets)
  var absJSSourceDirectory = path.resolve(jsSourceDirectory)
  var absGamesDirectory = path.resolve(gamesSourceDirectory)

  var happyPackPlugins = ["transform-react-jsx-component-data-ids", "transform-decorators-legacy"]

  if (env === "development") {
    happyPackPlugins.push("transform-react-jsx-location")
  }

  var webpackConfig = {
    context: absJSSourceDirectory,

    node: {
      fs: "empty",
      net: "empty",
      tls: "empty",
      console: true,
    },

    plugins: [
      new HappyPack({
        id: "js",
        loaders: [
          {
            loader: "babel-loader",
            query: {
              plugins: happyPackPlugins,
              presets: ["react", "es2015", "stage-0"],
              cacheDirectory: true,
            },
          },
        ],
        threads: 4,
      }),
    ],

    resolve: {
      alias: {
        styles: path.resolve(stylesSourceDirectory),
        models: path.resolve(jsSourceDirectory + "models/"),
        views: path.resolve(jsSourceDirectory + "views/"),
        conf: path.resolve(jsSourceDirectory + "configuration/"),
        operations: path.resolve(jsSourceDirectory + "operations/"),
        components: path.resolve(jsSourceDirectory + "components/"),
        common: path.resolve(jsSourceDirectory + "common/"),
        games: path.resolve(gamesSourceDirectory),
        phaser: phaser,
        pixi: pixi,
        p2: p2,
      },
      extensions: [".js", ".less"],
    },

    module: {
      rules: [
        {
          test: /\.js$/,
          use: ["happypack/loader?id=js"],
          exclude: [path.resolve(__dirname, "node_modules")],
          include: [absJSSourceDirectory, absGamesDirectory],
        },
        {
          test: /\.less$/,
          use: ["style-loader", "css-loader", "less-loader"],
        },
        {
          test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
          loader: "url-loader?limit=10000&minetype=application/font-woff",
          options: {
            limit: 10000,
            mimetype: "application/font-woff",
            name: config.assetsDirectory + config.fontsDirectory + "[name].[hash].[ext]",
          },
        },
        {
          test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
          loader: "url-loader",
          options: {
            limit: 10000,
            mimetype: "application/octet-stream",
            name: config.assetsDirectory + config.fontsDirectory + "[name].[hash].[ext]",
          },
        },
        {
          test: /\.(jpg|jpeg|png|gif)$/,
          use: [
            {
              loader: "file-loader",
              options: {
                name: config.assetsDirectory + config.imagesDirectory + "[name].[hash].[ext]",
              },
            },
            {
              loader: "image-webpack-loader",
              options: {
                bypassOnDebug: true,
              },
            },
          ],
        },
        {
          test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
          loader: "file-loader",
          options: {
            name: config.assetsDirectory + config.fontsDirectory + "[name].[hash].[ext]",
          },
        },
        {
          test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
          loader: "url-loader",
          options: {
            name: config.assetsDirectory + config.imagesDirectory + "[name].[hash].[ext]",
            limit: 10000,
            mimetype: "image/svg+xml",
          },
        },
        {
          test: require.resolve("react"),
          use: "expose-loader?React",
        },
        {
          test: /pixi\.js/,
          use: {
            loader: "expose-loader",
            query: "PIXI",
          },
        },
        {
          test: /phaser-split\.js$/,
          use: {
            loader: "expose-loader",
            query: "Phaser",
          },
        },
        {
          test: /p2\.js/,
          use: {
            loader: "expose-loader",
            query: "p2",
          },
        },
      ],
      noParse: [
        /node_modules\/json-schema\/lib\/validate\.js/, //,
        ///node_modules\/alloyeditor\/dist\/alloy-editor\/alloy-editor-no-react\.js/
      ],
    },
  }

  if (env !== "test") {
    // Karma doesn't need entry points or output settings

    webpackConfig.entry = {
      app: ["./app.js"],
      shared: ["pixi", "p2", "phaser"],
    }

    webpackConfig.output = {
      filename: config.assetsDirectory + config.javascriptDirectory + "[name].js",
      chunkFilename: config.assetsDirectory + config.javascriptDirectory + "[name].js",
      path: absPublicDirectory,
      publicPath: "/",
    }

    // Factor out common dependencies into a shared.js
    webpackConfig.plugins.push(new WriteFilePlugin())
  }

  if (env === "development") {
    webpackConfig.devtool = "#source-map"
    webpack.debug = true
    webpackConfig.mode = "development"
    webpackConfig.devServer = {
      inline: true,
      host: "0.0.0.0",
      port: port,
    }

    webpackConfig.entry["app"].push("webpack-dev-server/client?http://0.0.0.0:" + port)
    // webpackConfig.entry['app'].push('webpack/hot/only-dev-server');

    // webpackConfig.plugins.push(new webpack.HotModuleReplacementPlugin())
  }

  if (env === "production") {
    webpackConfig.devtool = "#nosources-source-map"
    webpackConfig.mode = "production"
    webpackConfig.plugins.push(
      new webpackManifest("/", "public"),
      new webpack.DefinePlugin({
        "process.env": {
          NODE_ENV: JSON.stringify("production"),
        },
      }),
      new UglifyJsPlugin({
        parallel: true,
        sourceMap: true,
        exclude: /\/node_modules/,
        uglifyOptions: {
          ecma: 5,
          mangle: true,
          compress: {
            sequences: true,
            dead_code: true,
            conditionals: true,
            booleans: true,
            unused: true,
            if_return: true,
            join_vars: true,
            drop_console: true,
          },
          output: {
            comments: false,
            beautify: false,
          },
        },
      })
    )
  }

  webpackConfig.optimization = {
    splitChunks: {
      cacheGroups: {
        commons: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendors",
          chunks: "all",
        },
      },
    },
  }

  return webpackConfig
}
