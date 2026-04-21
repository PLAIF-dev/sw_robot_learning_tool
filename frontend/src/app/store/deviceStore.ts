import { create } from 'zustand'
import { devicesApi } from '../api/devices'
import type { DeviceStatus } from '../types'

interface DeviceState {
  status: DeviceStatus | null
  fetchStatus: () => Promise<void>
}

export const useDeviceStore = create<DeviceState>((set) => ({
  status: null,

  async fetchStatus() {
    const status = await devicesApi.getStatus()
    set({ status })
  },
}))
