import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { readFileSync } from 'fs'

export default defineConfig(({ mode }) => {
  const env = readFileSync('.env', 'utf8')
  const matches = env.match(/NOTION_REDIRECT_URI=(https:\/\/.*)\/callback/)
  const apiUrl = matches ? matches[1] : 'http://localhost:3000'
  
  return {
    plugins: [vue()],
    define: {
      'import.meta.env.VITE_API_URL': JSON.stringify(apiUrl)
    },
    server: {
      proxy: {
        '/oauth-url': 'http://localhost:3000',
        '/auth': 'http://localhost:3000',
        '/pages': 'http://localhost:3000',
        '/databases': 'http://localhost:3000',
        '/me': 'http://localhost:3000',
        '/set-database': 'http://localhost:3000',
        '/callback': 'http://localhost:3000',
        '/api-url': 'http://localhost:3000',
      },
    },
  }
})