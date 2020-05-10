const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
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

const extractPlugin = new ExtractTextPlugin({
  filename: (getPath) => {
    const fileName = getPath('[name].css');
    return fileName === 'index.css' ? 'index.css': `popup/${fileName}`;
  },
});

const electron = new webpack.ExternalsPlugin('commonjs', [
  'electron',
]);

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
          'style-loader',
          'css-loader',
        ],
      },
      {
        test: /\.scss$/,
        use: extractPlugin.extract({
          use: [
            'css-loader',
            'sass-loader',
          ],
        }),
      },
    ],
  },
  plugins: [
    extractPlugin,
    electron,
    about,
    colorTransferTool,
    symbolInputTool,
  ],
};
