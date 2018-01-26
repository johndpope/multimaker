const webpack = require('webpack');
const CSSLoader = require('css-loader');

module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  }
  // plugins: [
  //   new webpack.DefinePlugin({
  //     'CANVAS_RENDERER': JSON.stringify(true),
  //     'WEBGL_RENDERER': JSON.stringify(true)
  //   })
  // ]
};
