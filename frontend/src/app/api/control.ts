import { apiClient } from './client'
import type { ControlResponse, CoordFrame, TcpTarget } from '../types'

export const controlApi = {
  async getTcpState() {
    const response = await apiClient.get('/control/tcp-state')
    return response.data
  },

  async selectTarget(target: TcpTarget) {
    await apiClient.post('/control/tcp-select', { target })
  },

  async move(target: TcpTarget, coordinateFrame: CoordFrame, dx: number, dy: number, dz: number) {
    const response = await apiClient.post<ControlResponse>('/control/tcp-move', { target, coordinateFrame, dx, dy, dz })
    return response.data
  },

  async rotate(target: TcpTarget, coordinateFrame: CoordFrame, dx: number, dy: number, dz: number) {
    const response = await apiClient.post<ControlResponse>('/control/tcp-rotate', { target, coordinateFrame, dx, dy, dz })
    return response.data
  },

  async jogJoint(target: TcpTarget, jointIndex: number, delta: number) {
    const response = await apiClient.post<ControlResponse>('/control/joint-jog', { target, jointIndex, delta })
    return response.data
  },

  async reset(target: TcpTarget) {
    await apiClient.post('/control/tcp-reset', { target })
  },
}
