import { create } from 'zustand'
import { sessionsApi } from '../api/sessions'
import type { Session, SessionMode } from '../types'

interface SessionState {
  sessions: Session[]
  activeSession: Session | null
  fetchSessions: () => Promise<void>
  activateSession: (id: string) => Promise<void>
  createSession: (name: string, mode: SessionMode, description: string, baseCheckpointId?: string) => Promise<void>
  duplicateSession: (id: string) => Promise<void>
}

export const useSessionStore = create<SessionState>((set, get) => ({
  sessions: [],
  activeSession: null,

  async fetchSessions() {
    const sessions = await sessionsApi.getAll()
    set({
      sessions,
      activeSession: sessions.find((session) => session.isActive) ?? null,
    })
  },

  async activateSession(id) {
    await sessionsApi.activate(id)
    await get().fetchSessions()
  },

  async createSession(name, mode, description, baseCheckpointId) {
    await sessionsApi.create({ name, mode, description, baseCheckpointId })
    await get().fetchSessions()
  },

  async duplicateSession(id) {
    await sessionsApi.duplicate(id)
    await get().fetchSessions()
  },
}))
