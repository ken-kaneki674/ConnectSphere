const path = require('path')
const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  // Le dossier public/ contient la version PHP : on utilise notre propre template
  // et on ne copie pas ses fichiers .php dans dist/
  chainWebpack: config => {
    config.plugin('html').tap(args => {
      args[0].template = path.resolve(__dirname, 'src/index.html')
      return args
    })
    config.plugins.delete('copy')
  },
  devServer: {
    port: 8080,
    historyApiFallback: true,
    proxy: {
      // Le backend Node expose ses routes sous /api : pas de réécriture de chemin
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true
      }
    }
  }
})
