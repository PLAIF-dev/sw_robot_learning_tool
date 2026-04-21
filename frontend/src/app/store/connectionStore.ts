import { create } from 'zustand'

interface ConnectionState {
  backendConnected: boolean
  setBackendConnected: (connected: boolean) => void
}

export const useConnectionStore = create<ConnectionState>((set) => ({
  backendConnected: false,
  setBackendConnected: (connected) => set({ backendConnected: connected }),
}))
