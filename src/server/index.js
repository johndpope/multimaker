// @ts-check

const path = require('path');
const express = require('express');
const webpack = require('webpack');
const webpackDeveMiddleware = require('webpack-dev-middleware');

const app = express();
const config = require('../../webpack.config.js');
const compiler = webpack(config);

app.use('/assets', express.static(path.resolve(__dirname, '..', '..', 'assets'), {
  index: false,
}))

app.use(webpackDeveMiddleware(compiler, {
  publicPath: config.output.publicPath,
}));

const PORT = 8080;
app.listen(PORT, () => {
  console.log('Listening on ' + PORT)
});
