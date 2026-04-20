export type SessionMode = 'NewTraining' | 'AdditionalTraining'
export type TrainingStage = 'Environment' | 'Classifier' | 'Demo' | 'MainTraining' | 'Evaluation'
export type TcpTarget = 'left' | 'right' | 'both'
export type ControlMode = 'move' | 'rotate'
export type CoordFrame = 'world' | 'local'
export type CameraChannel = 'left' | 'right' | 'head'
export type ReviewTab = 'motion' | 'demos' | 'episodes' | 'interventions'

export interface Session {
  id: string
  name: string
  mode: SessionMode
  description: string
  currentStage: TrainingStage
  isActive: boolean
  createdAt: string
  updatedAt: string
  baseCheckpointId?: string | null
}

export interface TcpPose {
  x: number
  y: number
  z: number
  roll: number
  pitch: number
  yaw: number
}

export interface DeviceStatus {
  leftArm: { connected: boolean; state: string; handGuideMode: boolean }
  rightArm: { connected: boolean; state: string; handGuideMode: boolean }
  controller: { connected: boolean; state: string }
  leftCamera: { connected: boolean; channel: string; width: number; height: number; fps: number }
  rightCamera: { connected: boolean; channel: string; width: number; height: number; fps: number }
  headCamera: { connected: boolean; channel: string; width: number; height: number; fps: number }
  leftGripper: { connected: boolean; openPercent: number }
  rightGripper: { connected: boolean; openPercent: number }
}

export interface DashboardSummary {
  activeSession: Pick<Session, 'id' | 'name' | 'mode' | 'currentStage' | 'isActive' | 'createdAt'> | null
  recentSessions: Array<Pick<Session, 'id' | 'name' | 'mode' | 'currentStage' | 'isActive' | 'createdAt'>>
  deviceSummary: {
    leftArmConnected: boolean
    rightArmConnected: boolean
    controllerConnected: boolean
    cameraConnectedCount: number
  }
  latestCheckpoint: Checkpoint | null
  recentDemoCount: number
  recentEpisodeCount: number
  overallSuccessRate: number
}

export interface TrainingEnvironment {
  robotModel: string
  cameraResolution: string
  gripperType: string
  controllerType: string
  learningRate: number
  batchSize: number
  maxEpisodes: number
}

export interface ClassifierStatus {
  successCount: number
  failureCount: number
  outOfRangeCount: number
  minRequired: number
  canProceed: boolean
  currentLabel: string
}

export interface DemoRecord {
  id: string
  sessionId: string
  startedAt: string
  endedAt?: string | null
  markedSuccess?: boolean | null
}

export interface DemoStatus {
  demoCount: number
  minRequired: number
  isRecording: boolean
  demos: DemoRecord[]
}

export interface EpisodeRecord {
  id: string
  sessionId: string
  episodeNumber: number
  success?: boolean | null
  durationSeconds?: number | null
  startedAt: string
  notes?: string | null
}

export interface MainTrainingStatus {
  isRunning: boolean
  totalEpisodes: number
  successCount: number
  successRate: number
  averageDuration: number
  recentEpisodes: EpisodeRecord[]
}

export interface EvaluationSummary {
  environmentConfigured: boolean
  classifierTrained: boolean
  demoCollected: boolean
  trainingCompleted: boolean
  totalEpisodes: number
  successRate: number
  nextRecommendedAction: string
  checkpoints: string[]
}

export interface MotionRecord {
  id: string
  sessionId: string
  type: string
  target: string
  startedAt: string
  endedAt?: string | null
  frameCount: number
}

export interface PlaybackFrame {
  timeOffset: number
  leftTcp: TcpPose
  rightTcp: TcpPose
  leftJoints: number[]
  rightJoints: number[]
}

export interface Checkpoint {
  id: string
  sessionId: string
  name: string
  successRate: number
  averageDuration: number
  totalEpisodes: number
  createdAt: string
  isBaseForAdditional: boolean
}

export interface InterventionRecord {
  id: string
  sessionId: string
  episodeId?: string
  createdAt: string
  reason: string
  motionRecordId: string
}

export interface ControlResponse {
  success: boolean
  targetTcpPose?: TcpPose | null
  solvedJointState?: number[] | null
  ikSuccess: boolean
  errorReason?: string | null
}
