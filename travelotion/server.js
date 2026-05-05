import express from 'express'
import cors from 'cors'
import { Client } from '@notionhq/client'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import https from 'https'
import { URL } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: path.resolve(__dirname, '.env') })

const app = express()

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization')
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200)
  }
  next()
})

app.use(express.json())

const clientId = process.env.NOTION_CLIENT_ID
const clientSecret = process.env.NOTION_CLIENT_SECRET
const apiUrl = process.env.NOTION_API_URL || 'http://localhost:3000'
const redirectUri = apiUrl + '/callback'

let notionClient = null
let currentAccessToken = null
let databaseId = null
let userId = null

function exchangeCodeForToken(code) {
  return new Promise((resolve, reject) => {
    const data = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: clientId,
      client_secret: clientSecret,
      code: code,
      redirect_uri: redirectUri,
    })

    const options = {
      hostname: 'api.notion.com',
      path: '/v1/oauth/token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }

    const req = https.request(options, (res) => {
      let body = ''
      res.on('data', chunk => body += chunk)
      res.on('end', () => {
        try {
          resolve(JSON.parse(body))
        } catch (e) {
          reject(e)
        }
      })
    })

    req.on('error', reject)
    req.write(data.toString())
    req.end()
  })
}

app.get('/callback', async (req, res) => {
  const { code, error } = req.query

  if (error) {
    return res.redirect(`/login?error=${error}`)
  }

  if (!code) {
    return res.redirect('/login?error=no_code')
  }

  try {
    const tokenData = await exchangeCodeForToken(code)
    
    currentAccessToken = tokenData.access_token
    userId = tokenData.owner.user.id
    
    notionClient = new Client({ auth: currentAccessToken })
    
    res.redirect(`/login?success=true&token=${encodeURIComponent(currentAccessToken)}`)
  } catch (error) {
    console.error('Error exchange:', error.message)
    res.redirect(`/login?error=exchange_failed`)
  }
})

app.post('/auth', (req, res) => {
  const { accessToken, databaseId: dbId } = req.body
  if (!accessToken) {
    return res.status(400).json({ error: 'accessToken requerido' })
  }
  notionClient = new Client({ auth: accessToken })
  currentAccessToken = accessToken
  databaseId = dbId
  res.json({ success: true })
})

app.get('/api-url', (req, res) => {
  res.send(redirectUri.replace('/callback', ''))
})

app.get('/oauth-url', (req, res) => {
  if (!clientId) {
    return res.status(500).json({ error: 'NOTION_CLIENT_ID no configurado' })
  }
  
  const authUrl = new URL('https://api.notion.com/v1/oauth/authorize')
  authUrl.searchParams.set('client_id', clientId)
  authUrl.searchParams.set('response_type', 'code')
  authUrl.searchParams.set('owner', 'user')
  authUrl.searchParams.set('redirect_uri', redirectUri)
  
  res.json({ url: authUrl.toString() })
})

app.get('/me', async (req, res) => {
  if (!notionClient) {
    return res.status(401).json({ error: 'No autenticado' })
  }
  try {
    const response = await notionClient.users.me()
    res.json(response)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.get('/databases', async (req, res) => {
  if (!notionClient) {
    return res.status(401).json({ error: 'No autenticado' })
  }
  try {
    const response = await notionClient.search({
      filter: { value: 'database', property: 'object' }
    })
    res.json(response.results)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.post('/set-database', async (req, res) => {
  const { databaseId: dbId } = req.body
  if (!dbId) {
    return res.status(400).json({ error: 'databaseId requerido' })
  }
  databaseId = dbId
  res.json({ success: true })
})

app.get('/pages', async (req, res) => {
  if (!notionClient || !databaseId) {
    return res.status(401).json({ error: 'No autenticado' })
  }
  try {
    const response = await notionClient.databases.query({ database_id: databaseId })
    res.json(response.results)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.post('/pages', async (req, res) => {
  if (!notionClient || !databaseId) {
    return res.status(401).json({ error: 'No autenticado' })
  }
  try {
    const response = await notionClient.pages.create({
      parent: { database_id: databaseId },
      properties: req.body,
    })
    res.json(response)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.get('/pages/:id', async (req, res) => {
  if (!notionClient || !databaseId) {
    return res.status(401).json({ error: 'No autenticado' })
  }
  try {
    const response = await notionClient.pages.retrieve({ page_id: req.params.id })
    res.json(response)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.patch('/pages/:id', async (req, res) => {
  if (!notionClient || !databaseId) {
    return res.status(401).json({ error: 'No autenticado' })
  }
  try {
    const response = await notionClient.pages.update({
      page_id: req.params.id,
      properties: req.body,
    })
    res.json(response)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.delete('/pages/:id', async (req, res) => {
  if (!notionClient || !databaseId) {
    return res.status(401).json({ error: 'No autenticado' })
  }
  try {
    const response = await notionClient.blocks.delete({ block_id: req.params.id })
    res.json(response)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

const PORT = process.env.PORT || 3000
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`)
})