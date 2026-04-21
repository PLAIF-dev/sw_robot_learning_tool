import { apiClient, safeGet } from './client'
import type { TaskItem, TaskMode } from '../types'

const fallbackTasks: TaskItem[] = [
  {
    id: 'task-001',
    name: 'Cup Pick Task v1',
    mode: 'NewTraining',
    description: '컵 집기 작업 초기 학습 작업',
    currentStage: 'Environment',
    isActive: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
  },
  {
    id: 'task-002',
    name: 'Sorting Task Demo',
    mode: 'NewTraining',
    description: '분류 시연용 메인 작업',
    currentStage: 'Evaluation',
    isActive: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
  },
]

export const tasksApi = {
  getAll: () => safeGet<TaskItem[]>('/tasks', fallbackTasks),

  async create(payload: { name: string; mode: TaskMode; description: string; baseCheckpointId?: string }): Promise<TaskItem> {
    const response = await apiClient.post<TaskItem>('/tasks', payload)
    return response.data
  },

  async duplicate(id: string): Promise<TaskItem> {
    const response = await apiClient.post<TaskItem>(`/tasks/${id}/duplicate`)
    return response.data
  },

  async activate(id: string): Promise<void> {
    await apiClient.post(`/tasks/${id}/activate`)
  },
}
