import { safeGet } from './client'
import type { DeviceStatus } from '../types'

const fallback: DeviceStatus = {
  leftArm: { connected: true, state: '준비', handGuideMode: false },
  rightArm: { connected: true, state: '준비', handGuideMode: false },
  controller: { connected: true, state: '연결됨' },
  leftCamera: { connected: true, channel: 'left', width: 640, height: 480, fps: 30 },
  rightCamera: { connected: true, channel: 'right', width: 640, height: 480, fps: 30 },
  headCamera: { connected: true, channel: 'head', width: 1280, height: 720, fps: 15 },
  leftGripper: { connected: true, openPercent: 82 },
  rightGripper: { connected: true, openPercent: 61 },
}

export const devicesApi = {
  getStatus: () => safeGet<DeviceStatus>('/devices/status', fallback),
}
