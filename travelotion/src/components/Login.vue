<template>
  <div class="login-container">
    <h1>Travelotion - Login con Notion</h1>
    
    <div v-if="!authenticated">
      <button @click="loginWithNotion" class="login-btn">
        Iniciar sesión con Notion
      </button>
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
  authenticate, 
  getUserInfo, 
  isAuthenticated,
  logout as doLogout,
} from '../services/notionClient'

const authenticated = ref(false)
const userName = ref('')
const error = ref('')
const success = ref(false)

onMounted(async () => {
  if (isAuthenticated()) {
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
    const res = await fetch('/api/oauth-url')
    const data = await res.json()
    window.location.href = data.url
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