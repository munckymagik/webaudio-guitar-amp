const webpack = require('webpack')

module.exports = {
  debug: true,
  devtool: 'source-map',
  entry: './src/main.ts',
  resolve: {
    extensions: ['', '.ts', '.js']
  },
  output: {
    path: __dirname,
    filename: 'bundle.js'
  },
  module: {
    preLoaders: [
      { test: /\.js$/, loader: 'eslint-loader', exclude: /node_modules/ }
    ],
    loaders: [
      { test: /\.ts$/, exclude: /node_modules/, loader: 'ts-loader' }
    ]
  },
  plugins: [
    new webpack.NoErrorsPlugin()
  ]
}
