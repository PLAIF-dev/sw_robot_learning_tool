import { apiClient, safeGet } from './client'
import type { DemoRecord, EpisodeRecord, InterventionRecord, MotionRecord, PlaybackFrame } from '../types'

const motionFallback: MotionRecord[] = [
  {
    id: 'mr-001',
    sessionId: 'sess-002',
    type: 'demo',
    target: 'both',
    startedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    endedAt: new Date(Date.now() - 1000 * 60 * 28).toISOString(),
    frameCount: 30,
  },
]

const playbackFallback: PlaybackFrame[] = Array.from({ length: 24 }, (_, index) => ({
  timeOffset: index * 0.2,
  leftTcp: { x: 0.3 + index * 0.002, y: 0.15, z: 0.5, roll: 0, pitch: -1.57, yaw: 0 },
  rightTcp: { x: 0.3, y: -0.15 + index * 0.001, z: 0.5, roll: 0, pitch: -1.57, yaw: 0 },
  leftJoints: [0.2, -0.4, 1, 0, 0.5, 0],
  rightJoints: [0.2, -0.4, 1, 0, 0.5, 0],
}))

export const recordsApi = {
  getMotion: () => safeGet<MotionRecord[]>('/records/motion', motionFallback),
  getMotionPlayback: (id: string) => safeGet<PlaybackFrame[]>(`/records/motion/${id}/playback`, playbackFallback),
  async startRecording(sessionId: string, type: string, target: string) {
    const response = await apiClient.post<MotionRecord>('/records/motion/start', { sessionId, type, target })
    return response.data
  },
  async stopRecording(id: string) {
    const response = await apiClient.post<MotionRecord>('/records/motion/stop', { id })
    return response.data
  },
  getDemos: () => safeGet<DemoRecord[]>('/records/demos', []),
  getDemoPlayback: (id: string) => safeGet<PlaybackFrame[]>(`/records/demos/${id}/playback`, playbackFallback),
  getEpisodes: () => safeGet<EpisodeRecord[]>('/records/episodes', []),
  getEpisodePlayback: (id: string) => safeGet<PlaybackFrame[]>(`/records/episodes/${id}/playback`, playbackFallback),
  getInterventions: () => safeGet<InterventionRecord[]>('/records/interventions', []),
  getInterventionPlayback: (id: string) => safeGet<PlaybackFrame[]>(`/records/interventions/${id}/playback`, playbackFallback),
}
