import { apiClient } from './client'

export const authApi = {
  async login(password: string) {
    const response = await apiClient.post<{ token: string; message: string }>('/auth/login', { password })
    return response.data
  },

  async status() {
    const response = await apiClient.get<{ isAuthenticated: boolean }>('/auth/status')
    return response.data.isAuthenticated
  },

  async logout() {
    await apiClient.post('/auth/logout')
  },
}
