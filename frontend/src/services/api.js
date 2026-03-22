import axios from 'axios'

const BACKEND_URL = import.meta.env.VITE_API_URL || ''
const BYPASS_SECRET = import.meta.env.VITE_BYPASS_SECRET || ''

const api = axios.create({
  baseURL: BACKEND_URL ? `${BACKEND_URL}/api` : '/api',
  headers: { 'Content-Type': 'application/json' }
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  if (BYPASS_SECRET) config.headers['x-vercel-protection-bypass'] = BYPASS_SECRET
  return config
})

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api
