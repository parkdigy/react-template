const path = require('path');
const webpack = require('webpack');
const env = require('dotenv').config({ path: path.resolve(__dirname, './../.env') }).parsed;
const ESLintPlugin = require('eslint-webpack-plugin');
const FriendlyErrorsWebpackPlugin = require('@soda/friendly-errors-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CircularDependencyPlugin = require('circular-dependency-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const { SourceMapDevToolPlugin } = require('webpack');
const TsConfigJson = require('./tsconfig.json');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const MyProvidePlugin = require('./webpack/ProvidePlugin');

/********************************************************************************************************************
 * Variables
 * ******************************************************************************************************************/

const isProduction = process.env.NODE_ENV === 'production';
const outputPath = path.resolve(__dirname, 'dist');
const devtool = isProduction ? false : 'eval';
const mode = isProduction ? 'production' : 'development';

/********************************************************************************************************************
 * MyHtmlPlugin
 * ******************************************************************************************************************/

class MyHtmlPlugin {
  apply(compiler) {
    compiler.hooks.compilation.tap('MyPlugin', (compilation) => {
      HtmlWebpackPlugin.getHooks(compilation).beforeEmit.tapAsync('MyHtmlPlugin', (data, cb) => {
        const splitText = '</head>';
        const htmls = data.html.split(splitText);
        const version = new Date().getTime();
        const inject = `
          <title>${isProduction ? '<%= title %>' : env.APP_NAME}</title>
          <script>window.$$MyAppConfig = {version: '${version}'}</script>
          <script>
            window.$$MyAppConfig = {
              version: '${version}',
              env: '${isProduction ? '<%= appEnv %>' : env.APP_ENV}',
              title: '${isProduction ? '<%= title %>' : env.APP_NAME}',
            };
          </script>
        `;

        data.html = `${htmls[0]}${inject}${splitText}${htmls[1]}`;

        cb(null, data);
      });
    });
  }
}

/********************************************************************************************************************
 * Alias
 * ******************************************************************************************************************/

const alias = {};
if (TsConfigJson.compilerOptions.paths) {
  const paths = TsConfigJson.compilerOptions.paths;
  Object.keys(paths).forEach((key) => {
    alias[key] = path.resolve(__dirname, paths[key][0]);
  });
}

/********************************************************************************************************************
 * Options
 * ******************************************************************************************************************/

const options = {
  mode,
  devtool,
  target: 'web',
  entry: './src',
  stats: isProduction,
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    alias,
  },
  output: {
    path: outputPath,
    publicPath: '/',
    clean: true,
    filename: '[name].[chunkhash].js',
    chunkFilename: 'chunks/[name].[chunkhash].js',
  },
  devServer: {
    host: env.APP_HOST,
    port: env.APP_PORT,
    hot: true,
    historyApiFallback: true,
    client: {
      overlay: { errors: false, runtimeErrors: false, warnings: false },
      progress: false,
    },
    proxy: [
      {
        context: ['/api'],
        target: env.API_URL,
        changeOrigin: true,
        pathRewrite: { '^/api': '' },
        logLevel: 'warn',
      },
    ],
  },
  performance: {
    hints: isProduction ? 'warning' : false,
    maxEntrypointSize: 512000,
    maxAssetSize: 512000,
  },
  optimization: {
    minimize: isProduction,
    runtimeChunk: true,
    removeAvailableModules: isProduction,
    removeEmptyChunks: isProduction,
    splitChunks: isProduction
      ? {
          chunks: 'all',
          cacheGroups: {
            common: {
              test: /[\\/]node_modules[\\/](react|react-dom|react-router|history|stylis)[\\/]/,
              chunks: 'all',
              name(module) {
                if (module.context.includes('/node_modules/')) {
                  const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];
                  return `vendors/_common_${packageName.replace('@', '')}`;
                }
              },
            },
            defaultVendors: {
              test: /[\\/]node_modules[\\/]/,
              chunks: 'all',
              name(module) {
                if (module.context.includes('/node_modules/')) {
                  const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];
                  if (packageName === '@pdg') {
                    return `vendors/_pdg_${module.context.match(/[\\/]node_modules\/@pdg[\\/](.*?)([\\/]|$)/)[1]}`;
                  }
                  return `vendors/${packageName.replace('@', '')}`;
                }
              },
            },
          },
        }
      : {},
  },
  plugins: [
    new MyProvidePlugin(),
    new ForkTsCheckerWebpackPlugin(),
    new ESLintPlugin({
      extensions: ['js', 'jsx', 'ts', 'tsx'],
      failOnError: isProduction,
      exclude: [
        path.resolve(__dirname, 'node_modules'),
        path.resolve(__dirname, 'dist'),
        path.resolve(__dirname, 'public'),
      ],
    }),
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
    new CopyPlugin({
      patterns: [{ from: './public/robots.txt', to: outputPath }],
    }),
    new MyHtmlPlugin(),
    new webpack.IgnorePlugin({
      resourceRegExp: /^\.\/locale$/,
      contextRegExp: /moment$/,
    }),
    ...(isProduction
      ? [
          new CircularDependencyPlugin({
            exclude: /a\.js|node_modules/,
            failOnError: true,
            allowAsyncCycles: false,
            cwd: process.cwd(),
          }),
          new MiniCssExtractPlugin({
            filename: 'css/[name].[contenthash].css', // 추출된 CSS 파일명 설정
          }),
          new BundleAnalyzerPlugin({
            openAnalyzer: false,
            analyzerMode: 'static',
            reportFilename: '../build/report.html',
          }),
        ]
      : [
          new SourceMapDevToolPlugin({
            filename: '[file].map',
          }),
          new FriendlyErrorsWebpackPlugin({
            clearConsole: true,
          }),
          new ReactRefreshWebpackPlugin({ overlay: false }),
        ]),
  ],
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        include: path.resolve(__dirname, 'src'),
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
          },
        ],
      },
      {
        test: /\.m?js$/,
        enforce: 'pre',
        resolve: {
          fullySpecified: false,
        },
        use: ['source-map-loader'],
      },
      {
        test: /\.html$/,
        use: {
          loader: 'html-loader',
          options: { minimize: true },
        },
      },
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          isProduction ? { loader: MiniCssExtractPlugin.loader, options: { publicPath: '../' } } : 'style-loader',
          'css-loader',
          'sass-loader',
        ],
      },
      {
        test: /\.(png|jpe?g|gif)(\?\S*)?$/,
        type: 'asset',
        parser: {
          dataUrlCondition: { maxSize: 100 * 1024 },
        },
        generator: {
          filename: 'assets/[name].[contenthash][ext]',
        },
      },
      {
        test: /\.svg$/i,
        issuer: /\.[jt]sx?$/,
        use: ['@svgr/webpack', 'url-loader?limit=100000&name=[name].[ext]'],
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
      },
      {
        test: /\.(txt|md)$/i,
        type: 'asset/source',
      },
    ],
  },
};

module.exports = options;
