const webpack = require('webpack')
const path = require('path')

module.exports = {
  debug: true,
  devtool: 'source-map',
  entry: './src/main.ts',
  resolve: {
    extensions: ['', '.ts', '.js']
  },
  output: {
    path: path.join(__dirname, 'assets'),
    filename: 'bundle.js'
  },
  module: {
    preLoaders: [
      { test: /\.ts$/, loader: 'tslint' }
    ],
    loaders: [
      { test: /\.ts$/, exclude: /node_modules/, loader: 'ts-loader' }
    ]
  },
  tslint: {
    emitErrors: true,
    failOnHint: true
  },
  plugins: [
    new webpack.NoErrorsPlugin()
  ]
}
