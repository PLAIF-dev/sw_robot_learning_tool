import { apiClient, safeGet } from './client'
import type { Session, SessionMode } from '../types'

const fallbackSessions: Session[] = [
  {
    id: 'sess-001',
    name: 'Cup Pick Task v1',
    mode: 'NewTraining',
    description: '컵 집기 작업 초기 학습 세션',
    currentStage: 'Environment',
    isActive: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
  },
  {
    id: 'sess-002',
    name: 'Sorting Task Demo',
    mode: 'NewTraining',
    description: '분류 시연용 메인 세션',
    currentStage: 'Evaluation',
    isActive: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
  },
]

export const sessionsApi = {
  getAll: () => safeGet<Session[]>('/sessions', fallbackSessions),

  async create(payload: { name: string; mode: SessionMode; description: string; baseCheckpointId?: string }): Promise<Session> {
    const response = await apiClient.post<Session>('/sessions', payload)
    return response.data
  },

  async duplicate(id: string): Promise<Session> {
    const response = await apiClient.post<Session>(`/sessions/${id}/duplicate`)
    return response.data
  },

  async activate(id: string): Promise<void> {
    await apiClient.post(`/sessions/${id}/activate`)
  },
}
