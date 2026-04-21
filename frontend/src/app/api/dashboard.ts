import { safeGet } from './client'
import type { DashboardSummary } from '../types'

const fallback: DashboardSummary = {
  activeTask: {
    id: 'task-002',
    name: 'Sorting Task Demo',
    mode: 'NewTraining',
    currentStage: 'Evaluation',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  recentTasks: [
    {
      id: 'task-002',
      name: 'Sorting Task Demo',
      mode: 'NewTraining',
      currentStage: 'Evaluation',
      isActive: true,
      createdAt: new Date().toISOString(),
    },
  ],
  deviceSummary: {
    leftArmConnected: true,
    rightArmConnected: true,
    controllerConnected: true,
    cameraConnectedCount: 3,
  },
  latestCheckpoint: {
    id: 'ckpt-002',
    taskId: 'task-002',
    name: 'Checkpoint-02',
    successRate: 0.78,
    averageDuration: 4.8,
    totalEpisodes: 80,
    createdAt: new Date().toISOString(),
    isBaseForAdditional: false,
  },
  recentDemoCount: 4,
  recentEpisodeCount: 10,
  overallSuccessRate: 0.7,
}

export const dashboardApi = {
  getSummary: () => safeGet<DashboardSummary>('/dashboard/summary', fallback),
}
