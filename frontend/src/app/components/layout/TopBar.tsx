import { Link } from 'react-router-dom'
import { ROUTES, TRAINING_STAGE_LABELS } from '../../constants'
import { useAuthStore } from '../../store/authStore'
import { useDeviceStore } from '../../store/deviceStore'
import { useSessionStore } from '../../store/sessionStore'
import { StatusBadge } from '../common/StatusBadge'

export function TopBar() {
  const logout = useAuthStore((state) => state.logout)
  const backendConnected = useDeviceStore((state) => state.backendConnected)
  const activeSession = useSessionStore((state) => state.activeSession)

  return (
    <header className="flex h-16 items-center justify-between border-b border-white/10 bg-slate-950/55 px-6">
      <div className="flex items-center gap-4">
        <Link to={ROUTES.dashboard} className="text-sm font-semibold uppercase tracking-[0.28em] text-sky-200">
          RLT Prototype
        </Link>
        {activeSession ? (
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-slate-100">{activeSession.name}</span>
            <StatusBadge tone={activeSession.mode === 'NewTraining' ? 'info' : 'warning'}>
              {activeSession.mode === 'NewTraining' ? '신규 학습' : '추가 학습'}
            </StatusBadge>
            <StatusBadge>{TRAINING_STAGE_LABELS[activeSession.currentStage]}</StatusBadge>
          </div>
        ) : (
          <span className="text-sm text-slate-400">활성 세션 없음</span>
        )}
      </div>
      <div className="flex items-center gap-3">
        <StatusBadge tone={backendConnected ? 'success' : 'danger'}>
          {backendConnected ? '백엔드 연결됨' : '백엔드 연결 끊김'}
        </StatusBadge>
        <StatusBadge tone="neutral">운영자</StatusBadge>
        <button className="rounded-xl border border-white/10 px-3 py-2 text-sm text-slate-300" onClick={() => void logout()}>
          로그아웃
        </button>
      </div>
    </header>
  )
}
