import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { readFileSync } from 'fs'

export default defineConfig(() => {
  const envContent = readFileSync('.env', 'utf8')
  const match = envContent.match(/NOTION_API_URL=(https:\/\/.*)/)
  const apiUrl = match ? match[1] : 'http://localhost:3000'
  
  return {
    plugins: [vue()],
    define: {
      'import.meta.env.VITE_API_URL': JSON.stringify(apiUrl)
    },
    server: {
      watch: {
        ignored: ['**/.env']
      },
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