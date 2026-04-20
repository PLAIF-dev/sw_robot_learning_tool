import { apiClient, safeGet } from './client'
import type {
  ClassifierStatus,
  DemoStatus,
  EvaluationSummary,
  MainTrainingStatus,
  TrainingEnvironment,
  TrainingStage,
} from '../types'

const environmentFallback: TrainingEnvironment = {
  robotModel: 'DualArm-Mock-v1',
  cameraResolution: '640x480',
  gripperType: 'Parallel',
  controllerType: 'Keyboard',
  learningRate: 0.001,
  batchSize: 32,
  maxEpisodes: 100,
}

const classifierFallback: ClassifierStatus = {
  successCount: 25,
  failureCount: 22,
  outOfRangeCount: 3,
  minRequired: 20,
  canProceed: true,
  currentLabel: 'success',
}

const demoFallback: DemoStatus = {
  demoCount: 4,
  minRequired: 3,
  isRecording: false,
  demos: [],
}

const mainFallback: MainTrainingStatus = {
  isRunning: false,
  totalEpisodes: 10,
  successCount: 7,
  successRate: 0.7,
  averageDuration: 4.9,
  recentEpisodes: [],
}

const evaluationFallback: EvaluationSummary = {
  environmentConfigured: true,
  classifierTrained: true,
  demoCollected: true,
  trainingCompleted: true,
  totalEpisodes: 10,
  successRate: 0.7,
  nextRecommendedAction: '체크포인트 저장 후 시연을 진행하세요.',
  checkpoints: ['ckpt-001', 'ckpt-002'],
}

export const trainingApi = {
  getCurrentStage: () => safeGet<{ stage: TrainingStage }>('/training/current-stage', { stage: 'Environment' }),
  setCurrentStage: async (stage: TrainingStage) => {
    await apiClient.put('/training/current-stage', { stage })
  },
  getEnvironment: () => safeGet<TrainingEnvironment>('/training/environment', environmentFallback),
  saveEnvironment: async (payload: TrainingEnvironment) => {
    await apiClient.put('/training/environment', payload)
  },
  getClassifier: () => safeGet<ClassifierStatus>('/training/classifier', classifierFallback),
  collectClassifier: async (label: 'success' | 'failure' | 'out_of_range') => {
    await apiClient.post('/training/classifier/collect', { label })
  },
  resetClassifier: async () => {
    await apiClient.post('/training/classifier/reset')
  },
  getDemo: () => safeGet<DemoStatus>('/training/demo', demoFallback),
  startDemo: async () => {
    await apiClient.post('/training/demo/start')
  },
  markDemoSuccess: async () => {
    await apiClient.post('/training/demo/mark-success')
  },
  endDemo: async () => {
    await apiClient.post('/training/demo/end')
  },
  deleteDemo: async (id: string) => {
    await apiClient.delete(`/training/demo/${id}`)
  },
  getMain: () => safeGet<MainTrainingStatus>('/training/main', mainFallback),
  startMain: async () => {
    await apiClient.post('/training/main/start')
  },
  stopMain: async () => {
    await apiClient.post('/training/main/stop')
  },
  markResult: async (success: boolean) => {
    await apiClient.post('/training/main/mark-result', { success })
  },
  deleteEpisode: async (id: string) => {
    await apiClient.delete(`/training/main/episodes/${id}`)
  },
  getEvaluation: () => safeGet<EvaluationSummary>('/training/evaluation', evaluationFallback),
}
