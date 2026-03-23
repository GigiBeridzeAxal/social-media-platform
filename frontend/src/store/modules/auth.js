import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('token'))
  const initialized = ref(false)

  const isAuthenticated = computed(() => !!token.value && !!user.value)

  async function init() {
    if (initialized.value) return
    if (token.value) {
      try {
        const { data } = await api.get('/auth/me')
        user.value = data
      } catch {
        token.value = null
        user.value = null
        localStorage.removeItem('token')
      }
    }
    initialized.value = true
  }

  async function login(credentials) {
    const { data } = await api.post('/auth/login', credentials)
    token.value = data.token
    user.value = data.user
    initialized.value = true
    localStorage.setItem('token', data.token)
    return data
  }

  async function register(userData) {
    const { data } = await api.post('/auth/register', userData)
    token.value = data.token
    user.value = data.user
    initialized.value = true
    localStorage.setItem('token', data.token)
    return data
  }

  async function logout() {
    await api.post('/auth/logout').catch(() => {})
    token.value = null
    user.value = null
    localStorage.removeItem('token')
  }

  async function fetchCurrentUser() {
    if (!token.value) return
    const { data } = await api.get('/auth/me')
    user.value = data
  }

  return { user, token, isAuthenticated, initialized, init, login, register, logout, fetchCurrentUser }
})
