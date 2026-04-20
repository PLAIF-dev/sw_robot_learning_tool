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
    try {
      await sessionsApi.activate(id)
    } catch {
      // mock fallback
    }

    const sessions = get().sessions.map((session) => ({
      ...session,
      isActive: session.id === id,
    }))

    set({
      sessions,
      activeSession: sessions.find((session) => session.id === id) ?? null,
    })
  },

  async createSession(name, mode, description, baseCheckpointId) {
    const created = await sessionsApi.create({ name, mode, description, baseCheckpointId })
    const sessions = [...get().sessions, created]
    set({ sessions })
  },

  async duplicateSession(id) {
    try {
      const duplicated = await sessionsApi.duplicate(id)
      set({ sessions: [...get().sessions, duplicated] })
    } catch {
      const session = get().sessions.find((item) => item.id === id)
      if (session) {
        const duplicated: Session = {
          ...session,
          id: `sess-${Date.now()}`,
          name: `${session.name} (복제)`,
          isActive: false,
        }
        set({
          sessions: [...get().sessions, duplicated],
        })
      }
    }
  },
}))
