import { apiClient, safeGet } from './client'
import type { Checkpoint } from '../types'

const fallback: Checkpoint[] = [
  {
    id: 'ckpt-001',
    taskId: 'task-002',
    name: '모델 A',
    successRate: 0.65,
    averageDuration: 5.2,
    totalEpisodes: 40,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    isBaseForAdditional: true,
  },
  {
    id: 'ckpt-002',
    taskId: 'task-002',
    name: '모델 B',
    successRate: 0.78,
    averageDuration: 4.8,
    totalEpisodes: 80,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    isBaseForAdditional: false,
  },
]

export const checkpointsApi = {
  getAll: () => safeGet<Checkpoint[]>('/checkpoints', fallback),
  async create(taskId: string, name: string) {
    const response = await apiClient.post<Checkpoint>('/checkpoints', { taskId, name })
    return response.data
  },
  async delete(id: string) {
    await apiClient.delete(`/checkpoints/${id}`)
  },
}
