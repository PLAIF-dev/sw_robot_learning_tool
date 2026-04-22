import type { CameraChannel, CoordFrame, TcpTarget, TrainingStage } from './types'

export const ROUTES = {
  login: '/login',
  dashboard: '/app/dashboard',
  tasks: '/app/tasks',
  training: '/app/training',
  review: '/app/review',
  checkpoints: '/app/checkpoints',
  system: '/app/system',
  robot: '/app/robot',
} as const

export const TRAINING_STAGE_LABELS: Record<TrainingStage, string> = {
  Environment: '기본 설정',
  Roi: '카메라 ROI 설정',
  Classifier: '판단 기준 데이터 준비',
  Demo: '초기 작업 데이터 준비',
  MainTraining: '자동 학습 실행',
  Evaluation: '결과 검토 및 배포',
}

export const TRAINING_STAGES: Array<{ key: TrainingStage; label: string; hint: string }> = [
  { key: 'Environment', label: TRAINING_STAGE_LABELS.Environment, hint: '로봇, 제어장치, 학습 기본값을 먼저 확인합니다.' },
  { key: 'Roi', label: TRAINING_STAGE_LABELS.Roi, hint: '왼쪽, 오른쪽, 헤드 카메라 화면을 크게 보며 ROI를 맞춥니다.' },
  { key: 'Classifier', label: TRAINING_STAGE_LABELS.Classifier, hint: '성공, 실패, 구간 비교 데이터를 모아 판단 기준을 만듭니다.' },
  { key: 'Demo', label: TRAINING_STAGE_LABELS.Demo, hint: '초기 시연을 모으고 좋은 기록만 골라 초기 모델을 준비합니다.' },
  { key: 'MainTraining', label: TRAINING_STAGE_LABELS.MainTraining, hint: '자동 실행 상태와 수동 개입 기록을 함께 보며 학습을 운영합니다.' },
  { key: 'Evaluation', label: TRAINING_STAGE_LABELS.Evaluation, hint: '저장된 모델을 비교하고 최종 모델을 선택합니다.' },
]

export const CAMERA_CHANNEL_LABELS: Record<CameraChannel, string> = {
  left: '왼쪽 카메라',
  right: '오른쪽 카메라',
  head: '헤드 카메라',
}

export const TARGET_LABELS: Record<TcpTarget, string> = {
  left: '왼팔',
  right: '오른팔',
  both: '양팔',
}

export const FRAME_LABELS: Record<CoordFrame, string> = {
  world: '월드',
  local: '로컬',
}

export const KEYMAP_HELP = [
  { target: '왼팔', keys: 'W/S (X축), A/D (Y축), Q/E (Z축)' },
  { target: '오른팔', keys: '방향키 (X/Y축), PgUp/PgDn (Z축)' },
]
