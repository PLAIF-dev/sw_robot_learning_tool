import { apiClient, safeGet } from './client'
import type { ControlResponse, CoordFrame, TcpTarget } from '../types'

const fallbackState = {
  leftTcp: { x: 0.3, y: 0.15, z: 0.5, roll: 0, pitch: -1.57, yaw: 0 },
  rightTcp: { x: 0.3, y: -0.15, z: 0.5, roll: 0, pitch: -1.57, yaw: 0 },
  leftJoints: [0.3, -0.5, 1, 0, 0.5, 0],
  rightJoints: [0.3, -0.5, 1, 0, 0.5, 0],
  ikSuccess: true,
}

export const controlApi = {
  getTcpState: () => safeGet('/control/tcp-state', fallbackState),

  async selectTarget(target: TcpTarget) {
    await apiClient.post('/control/tcp-select', { target })
  },

  async move(target: TcpTarget, coordinateFrame: CoordFrame, dx: number, dy: number, dz: number) {
    try {
      const response = await apiClient.post<ControlResponse>('/control/tcp-move', { target, coordinateFrame, dx, dy, dz })
      return response.data
    } catch {
      return { success: true, ikSuccess: true } satisfies ControlResponse
    }
  },

  async rotate(target: TcpTarget, coordinateFrame: CoordFrame, dx: number, dy: number, dz: number) {
    try {
      const response = await apiClient.post<ControlResponse>('/control/tcp-rotate', { target, coordinateFrame, dx, dy, dz })
      return response.data
    } catch {
      return { success: true, ikSuccess: true } satisfies ControlResponse
    }
  },

  async reset(target: TcpTarget) {
    await apiClient.post('/control/tcp-reset', { target })
  },
}
