let accessToken = localStorage.getItem('notion_token')
let databaseId = localStorage.getItem('notion_database_id')

export async function getOAuthUrl() {
  const res = await fetch('/api/oauth-url')
  const data = await res.json()
  return data.url
}

export async function authenticate(token, dbId) {
  accessToken = token
  databaseId = dbId
  localStorage.setItem('notion_token', token)
  localStorage.setItem('notion_database_id', dbId)
  
  const res = await fetch('/api/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ accessToken: token, databaseId: dbId }),
  })
  return res.json()
}

export async function setDatabase(dbId) {
  databaseId = dbId
  localStorage.setItem('notion_database_id', dbId)
  
  const res = await fetch('/api/set-database', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ databaseId: dbId }),
  })
  return res.json()
}

export async function getDatabases() {
  const res = await fetch('/api/databases')
  return res.json()
}

export async function getUserInfo() {
  const res = await fetch('/api/me')
  return res.json()
}

export async function getPages() {
  const res = await fetch('/api/pages')
  if (!res.ok) throw new Error('No autenticado')
  return res.json()
}

export async function createPage(properties) {
  const res = await fetch('/api/pages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(properties),
  })
  if (!res.ok) throw new Error('Error creando página')
  return res.json()
}

export async function getPage(pageId) {
  const res = await fetch(`/api/pages/${pageId}`)
  if (!res.ok) throw new Error('Página no encontrada')
  return res.json()
}

export async function updatePage(pageId, properties) {
  const res = await fetch(`/api/pages/${pageId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(properties),
  })
  if (!res.ok) throw new Error('Error actualizando página')
  return res.json()
}

export async function deletePage(pageId) {
  const res = await fetch(`/api/pages/${pageId}`, {
    method: 'DELETE',
  })
  if (!res.ok) throw new Error('Error eliminando página')
  return res.json()
}

export function isAuthenticated() {
  return !!accessToken
}

export function logout() {
  accessToken = null
  databaseId = null
  localStorage.removeItem('notion_token')
  localStorage.removeItem('notion_database_id')
}

export function getApiUrl() {
  return ''
}