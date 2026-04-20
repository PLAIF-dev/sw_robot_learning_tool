import axios from 'axios'

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ?? ''
const apiBaseUrl = rawBaseUrl ? `${rawBaseUrl}/api` : '/api'

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
  (response) => response,
  (error) => Promise.reject(error),
)

export async function safeGet<T>(path: string, fallback: T): Promise<T> {
  try {
    const response = await apiClient.get<T>(path)
    return response.data
  } catch {
    return fallback
  }
}
