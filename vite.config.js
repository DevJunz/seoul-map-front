// Use CommonJS require to improve compatibility on some Windows/node setups
const { defineConfig } = require('vite')
const vue = require('@vitejs/plugin-vue')

module.exports = defineConfig({
  plugins: [vue()],
  server: {
    // 같은 오리진으로 프록시해야 백엔드의 client_id 쿠키(SameSite=lax)가 브라우저에 저장/전송됨
    proxy: {
      '/api': {
        target: 'https://localhub-api-af8h.onrender.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
