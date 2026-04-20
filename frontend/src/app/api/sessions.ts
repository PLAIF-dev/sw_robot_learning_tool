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
    try {
      const response = await apiClient.post<Session>('/sessions', payload)
      return response.data
    } catch {
      return {
        id: `sess-${Date.now()}`,
        name: payload.name,
        mode: payload.mode,
        description: payload.description,
        currentStage: 'Environment',
        isActive: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        baseCheckpointId: payload.baseCheckpointId ?? null,
      }
    }
  },

  async duplicate(id: string): Promise<Session> {
    try {
      const response = await apiClient.post<Session>(`/sessions/${id}/duplicate`)
      return response.data
    } catch {
      const source = fallbackSessions.find((session) => session.id === id) ?? fallbackSessions[0]
      return {
        ...source,
        id: `sess-${Date.now()}`,
        name: `${source.name} (복제)`,
        isActive: false,
      }
    }
  },

  async activate(id: string) {
    await apiClient.post(`/sessions/${id}/activate`)
  },
}
