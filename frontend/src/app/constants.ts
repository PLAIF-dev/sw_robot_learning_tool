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

export const TRAINING_STAGES: Array<{ key: TrainingStage; label: string; hint: string }> = [
  { key: 'Environment', label: '기본 환경 설정', hint: '로봇, 카메라, 그리퍼, 제어 장치를 점검합니다.' },
  { key: 'Classifier', label: 'Classifier 학습', hint: '성공/실패/영역 이탈 샘플을 수집합니다.' },
  { key: 'Demo', label: '데모 수집', hint: '수동 조작으로 시범 데이터를 축적합니다.' },
  { key: 'MainTraining', label: '본 학습', hint: '에피소드 통계와 체크포인트를 관리합니다.' },
  { key: 'Evaluation', label: '평가 / 완료', hint: '최소 조건과 다음 액션을 확인합니다.' },
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
  world: 'World',
  local: 'Local',
}

export const KEYMAP_HELP = [
  { target: '왼팔', keys: 'W/S (X 축), A/D (Y 축), Q/E (Z 축)' },
  { target: '오른팔', keys: '방향키 (X/Y 축), PgUp/PgDn (Z 축)' },
]
