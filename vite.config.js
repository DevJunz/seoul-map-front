// Use CommonJS require to improve compatibility on some Windows/node setups
const { defineConfig } = require('vite')
const vue = require('@vitejs/plugin-vue')

module.exports = defineConfig({
  plugins: [vue()]
})
