/* eslint-env node */
const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const about = new HtmlWebpackPlugin({
  inject: false,
  filename: 'popup/about.html',
  template: './src/popup/about/about.html',
});

const colorTransferTool = new HtmlWebpackPlugin({
  inject: false,
  filename: 'popup/colorTransferTool.html',
  template: './src/popup/colorTransferTool/colorTransferTool.html',
});

const symbolInputTool = new HtmlWebpackPlugin({
  inject: false,
  filename: 'popup/symbolInputTool.html',
  template: './src/popup/symbolInputTool/symbolInputTool.html',
});

const electron = new webpack.ExternalsPlugin('commonjs', [
  'electron',
]);

const devMode = process.env.NODE_ENV !== "production";

module.exports = {
  mode: 'development',
  entry: {
    index: './src/main/scripts/index.js',
    about: './src/popup/about/about.js',
    colorTransferTool: './src/popup/colorTransferTool/colorTransferTool.js',
    symbolInputTool: './src/popup/symbolInputTool/symbolInputTool.js',
  },
  output: {
    filename: (chunkData) => {
      return chunkData.chunk.name === 'index' ? 'index.js': 'popup/[name].js';
    },
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          devMode ? "style-loader" : MiniCssExtractPlugin.loader,
          'css-loader',
        ],
      },
      {
        test: /\.scss$/,
        use: [
          devMode ? "style-loader" : MiniCssExtractPlugin.loader,
          'css-loader',
          'sass-loader',
        ],
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: (pathData) => pathData.chunk.name === 'index' ? '[name].css' : 'popup/[name].js',
    }),
    electron,
    about,
    colorTransferTool,
    symbolInputTool,
  ],
};
