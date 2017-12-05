const path = require('path');
const slsw = require('serverless-webpack');
const nodeExternals = require('webpack-node-externals');
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  entry:     slsw.lib.entries,
  target:    'node',
  devtool:   'source-map',
  externals: [nodeExternals()],

  module: {
    rules: [{
      test:   /\.ts$/,
      loader: 'awesome-typescript-loader',

      options: {
        lib: [
          'dom',
          'es2017',
          'esnext.asynciterable',
        ],
      },
    }]
  },

  resolve: {
    extensions: [
      '.ts',
      '.js',
    ],
  },

  plugins: [
    new CopyWebpackPlugin([
      {from: "dist/client/**/*"},
    ]),
  ],

  output: {
    libraryTarget: 'commonjs',
    path:          path.join(__dirname, '..', 'dist', 'lambda'),
    filename:      '[name].js',
  },
};
