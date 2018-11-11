const path = require('path')

module.exports = {
  mode: 'development',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  }
}
