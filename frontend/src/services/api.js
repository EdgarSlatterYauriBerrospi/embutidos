import axios from 'axios'
import { restoreAuthSession } from './authSession.js'

// Without VITE_API_URL, relative URLs use the current origin.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 15000,
  headers: { Accept: 'application/json' },
})

api.interceptors.request.use((config) => {
  // Read the current session for each request; never cache a token after logout.
  const token = restoreAuthSession()?.token
  if (config.url !== '/api/auth/login' && token) {
    config.headers.set('Authorization', `Bearer ${token}`)
  } else {
    config.headers.delete('Authorization')
  }
  return config
})

export default api
