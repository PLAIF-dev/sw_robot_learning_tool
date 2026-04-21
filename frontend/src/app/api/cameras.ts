import type { CameraChannel } from '../types'

export const CAMERA_FPS = 5
export const CAMERA_FRAME_INTERVAL_MS = Math.round(1000 / CAMERA_FPS)

export const camerasApi = {
  getFrameUrl(channel: CameraChannel, cacheKey: number) {
    return `/api/cameras/${channel}/frame?v=${cacheKey}`
  },
}
