<template>
  <div class="callback">
    <p v-if="loading">Procesando...</p>
    <p v-if="error" style="color: red">{{ error }}</p>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  const params = new URLSearchParams(window.location.search)
  const code = params.get('code')
  const errorParam = params.get('error')

  if (errorParam) {
    router.replace('/login?error=' + errorParam)
    return
  }

  if (!code) {
    router.replace('/login?error=no_code')
    return
  }

  try {
    const res = await fetch('/api/callback?code=' + code)
    const data = await res.json()

    if (data.token) {
      localStorage.setItem('notion_token', data.token)
      router.replace('/?logged=true')
    } else {
      throw new Error(data.error || 'Token no recibido')
    }
  } catch (e) {
    error.value = e.message
    setTimeout(() => router.replace('/login?error=' + encodeURIComponent(e.message)), 2000)
  }
})
</script>