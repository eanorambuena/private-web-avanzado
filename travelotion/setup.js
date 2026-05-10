import { spawn, exec } from 'child_process'
import { writeFileSync, readFileSync } from 'fs'

const CLOUD_URL_MATCH = /https:\/\/[\w-]+\.trycloudflare\.com/

let serverPid = null
let vitePid = null

function killAll() {
  exec('pkill -f "node server" || true')
  exec('pkill -f vite || true')
}

function updateEnv(url) {
  const content = readFileSync('.env', 'utf8')
  const current = content.match(/NOTION_API_URL=(https:\/\/.*)/)?.[1]
  
  if (current !== url) {
    const newContent = content.replace(/NOTION_API_URL=.*/m, `NOTION_API_URL=${url}`)
    writeFileSync('.env', newContent)
    console.log('📝 .env actualizado:', url)
    console.log('🌐 Callback URL: ' + url + '/callback\n')
    
    console.log('🔄 Reiniciando Express...')
    exec('pkill -f "node server" || true')
    setTimeout(() => {
      serverPid = spawn('node', ['server.js'], { stdio: 'inherit', shell: true })
    }, 1000)
  }
}

function startAll() {
  console.log('🚀 Server + Vite...')
  serverPid = spawn('node', ['server.js'], { stdio: 'inherit', shell: true })
  setTimeout(() => {
    vitePid = spawn('npm', ['run', 'dev'], { stdio: 'inherit', shell: true })
  }, 1500)
}

function startTunnel() {
  const tunnel = spawn('npm', ['run', 'tunnel'], { stdio: 'pipe', shell: true })
  
  tunnel.stdout.on('data', (data) => {
    const match = data.toString().match(CLOUD_URL_MATCH)
    if (match) updateEnv(match[0])
  })

  tunnel.stderr.on('data', (data) => {
    const match = data.toString().match(CLOUD_URL_MATCH)
    if (match) updateEnv(match[0])
  })

  tunnel.on('exit', () => setTimeout(startTunnel, 2000))
}

console.log('🎬 Travelotion Setup\n')
startAll()
setTimeout(startTunnel, 3000)