import { safeGet } from './client'
import type { CameraChannel } from '../types'

const fallbackFrame = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='

export const camerasApi = {
  async getFrame(channel: CameraChannel) {
    const response = await safeGet<{ frame: string }>(`/cameras/${channel}/frame`, { frame: fallbackFrame })
    return response.frame
  },
}
