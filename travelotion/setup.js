import { spawn } from 'child_process'
import { writeFileSync, readFileSync } from 'fs'
import { watch } from 'fs'

const CLOUD_URL_MATCH = /https:\/\/[\w-]+\.trycloudflare\.com/

function updateClient(url) {
  const content = readFileSync('src/services/notionClient.js', 'utf8')
  const newContent = content.replace(
    /const API_URL = '.*'/,
    `const API_URL = '${url}'`
  )
  writeFileSync('src/services/notionClient.js', newContent)
  console.log('📝 Actualizado:', url)
}

function startServer() {
  spawn('node', ['server.js'], { stdio: 'inherit', shell: true })
}

function startVite() {
  spawn('npm', ['run', 'dev'], { stdio: 'inherit', shell: true })
}

function startTunnel() {
  const tunnel = spawn('npx', ['cloudflared', 'tunnel', '--url', 'http://localhost:3000'], { 
    stdio: 'pipe', 
    shell: true 
  })

  tunnel.stdout.on('data', (data) => {
    const match = data.toString().match(CLOUD_URL_MATCH)
    if (match) {
      const url = match[0]
      updateClient(url)
      console.log('\n🌐 ' + url + '/callback\n')
    }
  })

  tunnel.stderr.on('data', (data) => {
    const match = data.toString().match(CLOUD_URL_MATCH)
    if (match) {
      const url = match[0]
      updateClient(url)
      console.log('\n🌐 ' + url + '/callback\n')
    }
  })

  tunnel.on('exit', () => process.exit(1))
}

console.log('🚀 Starting...')
startServer()

setTimeout(() => {
  startVite()
  startTunnel()
}, 2000)