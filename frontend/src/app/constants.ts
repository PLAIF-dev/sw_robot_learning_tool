import type { CameraChannel, CoordFrame, TcpTarget, TrainingStage } from './types'

export const ROUTES = {
  login: '/login',
  dashboard: '/app/dashboard',
  sessions: '/app/sessions',
  training: '/app/training',
  review: '/app/review',
  checkpoints: '/app/checkpoints',
  system: '/app/system',
} as const

export const TRAINING_STAGE_LABELS: Record<TrainingStage, string> = {
  Environment: '기본 환경 설정',
  Roi: '카메라 ROI 설정',
  Classifier: 'Classifier 학습',
  Demo: '데모 수집',
  MainTraining: '본 학습',
  Evaluation: '평가 / 완료',
}

export const TRAINING_STAGES: Array<{ key: TrainingStage; label: string; hint: string }> = [
  { key: 'Environment', label: TRAINING_STAGE_LABELS.Environment, hint: '로봇과 제어 장치, 학습 기본 파라미터를 설정합니다.' },
  { key: 'Roi', label: TRAINING_STAGE_LABELS.Roi, hint: 'Left, Right, Head 카메라 ROI 박스를 조정하고 저장합니다.' },
  { key: 'Classifier', label: TRAINING_STAGE_LABELS.Classifier, hint: '성공, 실패, 영역 이탈 샘플을 수집합니다.' },
  { key: 'Demo', label: TRAINING_STAGE_LABELS.Demo, hint: '수동 조작으로 시범 데이터를 축적합니다.' },
  { key: 'MainTraining', label: TRAINING_STAGE_LABELS.MainTraining, hint: '에피소드 통계와 체크포인트를 관리합니다.' },
  { key: 'Evaluation', label: TRAINING_STAGE_LABELS.Evaluation, hint: '최소 조건과 다음 액션을 확인합니다.' },
]

export const CAMERA_CHANNEL_LABELS: Record<CameraChannel, string> = {
  left: 'L 카메라',
  right: 'R 카메라',
  head: 'Head 카메라',
}

export const TARGET_LABELS: Record<TcpTarget, string> = {
  left: '왼팔',
  right: '오른팔',
  both: '양팔',
}

export const FRAME_LABELS: Record<CoordFrame, string> = {
  world: 'World',
  local: 'Local',
}

export const KEYMAP_HELP = [
  { target: '왼팔', keys: 'W/S (X축), A/D (Y축), Q/E (Z축)' },
  { target: '오른팔', keys: '방향키 (X/Y축), PgUp/PgDn (Z축)' },
]
