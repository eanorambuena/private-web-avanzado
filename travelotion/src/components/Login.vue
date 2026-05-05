<template>
  <div class="login-container">
    <h1>Travelotion - Login con Notion</h1>
    
    <div v-if="!authenticated">
      <button @click="loginWithNotion" class="login-btn">
        Iniciar sesión con Notion
      </button>
      <p class="url-info">Configura en Notion: {{ apiUrl }}/callback</p>
    </div>
    
    <div v-else class="user-info">
      <p>Bienvenido, {{ userName }}</p>
      <button @click="logout" class="logout-btn">Cerrar sesión</button>
    </div>
    
    <div v-if="error" class="error">{{ error }}</div>
    <div v-if="success" class="success">¡Login exitoso!</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { 
  getOAuthUrl, 
  authenticate, 
  getUserInfo, 
  isAuthenticated,
  logout as doLogout,
  getApiUrl
} from '../services/notionClient'

const authenticated = ref(false)
const userName = ref('')
const error = ref('')
const success = ref(false)
const apiUrl = ref('')

onMounted(async () => {
  apiUrl.value = getApiUrl()
  
  const params = new URLSearchParams(window.location.search)
  
  if (params.get('success') === 'true') {
    const token = params.get('token')
    if (token) {
      await authenticate(token, '35701371e9728079ae5a000c8e7b96e1')
      authenticated.value = true
      success.value = true
      window.history.replaceState({}, '', '/')
    }
  } else if (params.get('error')) {
    error.value = params.get('error')
  } else if (isAuthenticated()) {
    try {
      const user = await getUserInfo()
      userName.value = user.name || 'Usuario'
      authenticated.value = true
    } catch (e) {
      doLogout()
    }
  }
})

async function loginWithNotion() {
  try {
    const url = await getOAuthUrl()
    window.location.href = url
  } catch (e) {
    error.value = e.message
  }
}

async function logout() {
  doLogout()
  authenticated.value = false
  userName.value = ''
}
</script>

<style scoped>
.login-container {
  max-width: 400px;
  margin: 50px auto;
  padding: 20px;
  text-align: center;
}

.login-btn {
  background: #fff;
  border: 2px solid #000;
  padding: 15px 30px;
  font-size: 16px;
  cursor: pointer;
}

.login-btn:hover {
  background: #000;
  color: #fff;
}

.logout-btn {
  background: #f5f5f5;
  border: 1px solid #ccc;
  padding: 10px 20px;
  cursor: pointer;
}

.user-info { margin: 20px 0; }
.error { color: red; margin-top: 20px; }
.success { color: green; margin-top: 20px; }
.url-info { font-size: 12px; color: #666; margin-top: 30px; word-break: break-all; }
</style>