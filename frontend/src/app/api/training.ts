import { apiClient, safeGet } from './client'
import type {
  CameraChannel,
  ClassifierStatus,
  DemoStatus,
  EvaluationSummary,
  MainTrainingStatus,
  RoiRectangle,
  TrainingEnvironment,
  TrainingStage,
} from '../types'

const environmentFallback: TrainingEnvironment = {
  robotModel: 'RB3 듀얼암 로봇',
  controllerType: '3D Mouse',
  learningRate: 0.001,
  batchSize: 32,
  maxEpisodes: 100,
}

const roiFallback: RoiRectangle[] = [
  { channel: 'left', x: 0.16, y: 0.18, width: 0.28, height: 0.28 },
  { channel: 'right', x: 0.54, y: 0.2, width: 0.24, height: 0.26 },
  { channel: 'head', x: 0.3, y: 0.22, width: 0.34, height: 0.3 },
]

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
  roiConfigured: true,
  classifierTrained: true,
  demoCollected: true,
  trainingCompleted: true,
  totalEpisodes: 10,
  successRate: 0.7,
  nextRecommendedAction: '모델 비교 후 최종 모델을 선택하세요.',
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
  getRoi: () => safeGet<RoiRectangle[]>('/training/roi', roiFallback),
  saveRoi: async (channel: CameraChannel, roi: Omit<RoiRectangle, 'channel'>) => {
    const response = await apiClient.put<RoiRectangle>(`/training/roi/${channel}`, roi)
    return response.data
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
