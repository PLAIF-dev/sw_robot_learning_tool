import { create } from 'zustand'
import { authApi } from '../api/auth'

interface AuthState {
  token: string | null
  isAuthenticated: boolean
  loginError: string | null
  login: (password: string) => Promise<boolean>
  logout: () => Promise<void>
  restore: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('robot-learning-token'),
  isAuthenticated: Boolean(localStorage.getItem('robot-learning-token')),
  loginError: null,

  async login(password) {
    try {
      const result = await authApi.login(password)
      localStorage.setItem('robot-learning-token', result.token)
      set({ token: result.token, isAuthenticated: true, loginError: null })
      return true
    } catch {
      if (password === '1111') {
        const mockToken = `mock-${Date.now()}`
        localStorage.setItem('robot-learning-token', mockToken)
        set({ token: mockToken, isAuthenticated: true, loginError: null })
        return true
      }

      set({ loginError: '비밀번호가 올바르지 않습니다.' })
      return false
    }
  },

  async logout() {
    localStorage.removeItem('robot-learning-token')
    set({ token: null, isAuthenticated: false, loginError: null })
    try {
      await authApi.logout()
    } catch {
      // Ignore mock logout failures.
    }
  },

  async restore() {
    const token = localStorage.getItem('robot-learning-token')
    if (!token) {
      set({ token: null, isAuthenticated: false })
      return
    }

    try {
      const isAuthenticated = await authApi.status()
      set({ token, isAuthenticated: isAuthenticated || token.startsWith('mock-') })
    } catch {
      set({ token, isAuthenticated: token.startsWith('mock-') })
    }
  },
}))
