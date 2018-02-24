const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const APP_DIR = path.resolve(__dirname, 'src');
const BUILD_DIR = path.resolve(__dirname, 'public');

const extractSass = new ExtractTextPlugin({
  filename: "[name].[contenthash].css",
  disable: process.env.NODE_ENV === "development"
});

module.exports = {
  entry: path.resolve(APP_DIR, 'renderer' , 'index.jsx'),
  output: {
    path: BUILD_DIR,
    filename: 'bundle.js',
    publicPath: '/',
  },
  module: {
    rules: [
      {
        test: /\.(j|t)sx?$/,
        exclude: /node_modules/,
        use: 'ts-loader'
      },
      {
        test: /\.s?css$/,
        use: extractSass.extract({
          use: [
            {
              loader: 'css-loader',
              options: { sourceMap: true },
            },
            {
              loader: 'sass-loader',
              options: { sourceMap: true },
            }
          ],
          fallback: 'style-loader',
        }),
      }
    ]
  },
  resolve: {
    modules: [APP_DIR, 'node_modules'],
    extensions: ['.js', '.json', '.jsx', '.ts', '.tsx', '.css', '.scss']
  },
  devtool: 'inline-source-map',
  plugins: [
    new CleanWebpackPlugin(['public']),
    new HtmlWebpackPlugin({
      title: 'Multi-Maker',
      template: 'src/index.html',
    }),
    extractSass
  ]
};
