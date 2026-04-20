import { create } from 'zustand'
import { devicesApi } from '../api/devices'
import type { DeviceStatus } from '../types'

interface DeviceState {
  status: DeviceStatus | null
  backendConnected: boolean
  fetchStatus: () => Promise<void>
}

export const useDeviceStore = create<DeviceState>((set) => ({
  status: null,
  backendConnected: false,

  async fetchStatus() {
    try {
      const status = await devicesApi.getStatus()
      set({ status, backendConnected: true })
    } catch {
      set({ backendConnected: false })
    }
  },
}))
