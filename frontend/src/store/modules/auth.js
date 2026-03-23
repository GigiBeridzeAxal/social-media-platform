import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('token'))
  const initialized = ref(false)

  // Authenticated when we have a confirmed user object (not just a token)
  const isAuthenticated = computed(() => !!user.value)

  async function init() {
    if (initialized.value) return
    try {
      // Always attempt /auth/me — will succeed via cookie OR Bearer header
      const { data } = await api.get('/auth/me')
      user.value = data
    } catch {
      user.value = null
      token.value = null
      localStorage.removeItem('token')
    }
    initialized.value = true
  }

  async function login(credentials) {
    const { data } = await api.post('/auth/login', credentials)
    // Store token in localStorage as fallback for environments blocking cookies
    if (data.token) {
      token.value = data.token
      localStorage.setItem('token', data.token)
    }
    user.value = data.user
    initialized.value = true
    return data
  }

  async function register(userData) {
    const { data } = await api.post('/auth/register', userData)
    if (data.token) {
      token.value = data.token
      localStorage.setItem('token', data.token)
    }
    user.value = data.user
    initialized.value = true
    return data
  }

  async function logout() {
    await api.post('/auth/logout').catch(() => {})
    token.value = null
    user.value = null
    initialized.value = false
    localStorage.removeItem('token')
  }

  async function fetchCurrentUser() {
    const { data } = await api.get('/auth/me')
    user.value = data
  }

  return { user, token, isAuthenticated, initialized, init, login, register, logout, fetchCurrentUser }
})
