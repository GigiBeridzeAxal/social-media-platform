import axios from 'axios'

const BACKEND_URL = import.meta.env.VITE_API_URL || ''
const BYPASS_SECRET = import.meta.env.VITE_BYPASS_SECRET || ''

const api = axios.create({
  baseURL: BACKEND_URL ? `${BACKEND_URL}/api` : '/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true // Send/receive cookies for cross-origin requests
})

api.interceptors.request.use(config => {
  // Keep Bearer token as fallback for environments where cookies don't work
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  if (BYPASS_SECRET) config.headers['x-vercel-protection-bypass'] = BYPASS_SECRET
  return config
})

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      const url = err.config?.url || ''
      // Don't auto-redirect for auth endpoints — let the store/router handle those
      const isAuthEndpoint = url.includes('/auth/me') || url.includes('/auth/login') || url.includes('/auth/register')
      if (!isAuthEndpoint) {
        localStorage.removeItem('token')
        if (window.location.pathname !== '/login') {
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(err)
  }
)

export default api
