const merge = require('webpack-merge')
const common = require('./webpack.common.js')

module.exports = merge(common, {
  mode: 'production',
  resolve: {
    alias: {
      p5: 'p5/lib/p5.min.js'
    }
  }
})
