const path = require('path');

module.exports = {
  entry: './web-demo.ts',
  output: {
    filename: 'web-demo.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js']
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  devServer: {
    static: {
      directory: path.join(__dirname, './')
    },
    compress: true,
    port: 8080,
    open: true
  },
  mode: 'development'
};

// Made with Bob
