import axios from 'axios'
import { useConnectionStore } from '../store/connectionStore'

const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '')
const apiBaseUrl = configuredBaseUrl ? `${configuredBaseUrl}/api` : '/api'

export const apiClient = axios.create({
  baseURL: apiBaseUrl,
  timeout: 8000,
})

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('robot-learning-token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => {
    useConnectionStore.getState().setBackendConnected(true)
    return response
  },
  (error) => {
    const connected = Boolean(error?.response)
    useConnectionStore.getState().setBackendConnected(connected)
    return Promise.reject(error)
  },
)

export async function safeGet<T>(path: string, fallback: T): Promise<T> {
  try {
    const response = await apiClient.get<T>(path)
    return response.data
  } catch {
    return fallback
  }
}
