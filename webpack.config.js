const path = require('path')

module.exports = {
  mode: 'production',
  entry: './src/example.js',
  output: {
    filename: 'earth.min.js',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'eslint-loader',
        enforce: "pre",
        include: [path.resolve(__dirname, 'src')]
      },
      {
        test: /\.(vs|fs|glsl)(\?.*)?$/,
        use: [
          'raw-loader'
        ]
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: [
          'url-loader'
        ]
      }
    ]
  },
  performance: {
    hints: false
  }
}
