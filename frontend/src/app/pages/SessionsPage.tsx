import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { TRAINING_STAGE_LABELS } from '../constants'
import { useSessionStore } from '../store/sessionStore'
import type { SessionMode } from '../types'

export function SessionsPage() {
  const sessions = useSessionStore((state) => state.sessions)
  const activeSession = useSessionStore((state) => state.activeSession)
  const createSession = useSessionStore((state) => state.createSession)
  const activateSession = useSessionStore((state) => state.activateSession)
  const duplicateSession = useSessionStore((state) => state.duplicateSession)

  const [name, setName] = useState('')
  const [mode, setMode] = useState<SessionMode>('NewTraining')
  const [description, setDescription] = useState('')
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(activeSession?.id ?? null)

  const selectedSession = useMemo(
    () => sessions.find((session) => session.id === selectedSessionId) ?? null,
    [selectedSessionId, sessions],
  )

  async function handleCreate(event: FormEvent) {
    event.preventDefault()
    if (!name.trim()) {
      return
    }

    await createSession(name.trim(), mode, description.trim())
    setName('')
    setDescription('')
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <section className="panel p-6">
        <div className="section-title">세션 목록</div>
        <div className="mt-4 space-y-3">
          {sessions.map((session) => (
            <button
              key={session.id}
              className={`w-full rounded-2xl border px-4 py-4 text-left transition ${
                selectedSessionId === session.id ? 'border-sky-400/50 bg-sky-500/10' : 'border-white/10 bg-white/5'
              }`}
              onClick={() => setSelectedSessionId(session.id)}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-semibold text-slate-100">{session.name}</div>
                  <div className="mt-2 text-sm text-slate-400">{session.description}</div>
                </div>
                {session.isActive && <span className="rounded-full bg-emerald-500/20 px-2 py-1 text-xs text-emerald-200">현재 세션</span>}
              </div>
              <div className="mt-3 flex gap-2 text-xs text-slate-400">
                <span>{session.mode === 'NewTraining' ? '신규 학습' : '추가 학습'}</span>
                <span>•</span>
                <span>{TRAINING_STAGE_LABELS[session.currentStage]}</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      <div className="space-y-6">
        <section className="panel p-6">
          <div className="section-title">신규 / 추가 학습 세션 생성</div>
          <form className="mt-4 space-y-4" onSubmit={handleCreate}>
            <input
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-slate-100"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="세션 이름"
            />
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                className={`rounded-2xl px-4 py-3 text-sm ${mode === 'NewTraining' ? 'bg-sky-500 text-white' : 'bg-white/5 text-slate-300'}`}
                onClick={() => setMode('NewTraining')}
              >
                신규 학습
              </button>
              <button
                type="button"
                className={`rounded-2xl px-4 py-3 text-sm ${mode === 'AdditionalTraining' ? 'bg-amber-500 text-white' : 'bg-white/5 text-slate-300'}`}
                onClick={() => setMode('AdditionalTraining')}
              >
                추가 학습
              </button>
            </div>
            <textarea
              className="min-h-[120px] w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-slate-100"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="세션 설명"
            />
            <button className="w-full rounded-2xl bg-sky-500 px-4 py-3 text-sm font-semibold text-white" type="submit">
              세션 생성
            </button>
          </form>
        </section>

        <section className="panel p-6">
          <div className="section-title">세션 상세 패널</div>
          {selectedSession ? (
            <div className="mt-4 space-y-4">
              <div>
                <div className="text-xl font-semibold text-slate-100">{selectedSession.name}</div>
                <div className="mt-2 text-sm text-slate-400">{selectedSession.description}</div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="panel-muted p-4">
                  <div className="section-title">모드</div>
                  <div className="mt-2 text-sm text-slate-100">{selectedSession.mode === 'NewTraining' ? '신규 학습' : '추가 학습'}</div>
                </div>
                <div className="panel-muted p-4">
                  <div className="section-title">현재 단계</div>
                  <div className="mt-2 text-sm text-slate-100">{TRAINING_STAGE_LABELS[selectedSession.currentStage]}</div>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <button className="rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white" onClick={() => void activateSession(selectedSession.id)}>
                  현재 세션으로 활성화
                </button>
                <button className="rounded-2xl bg-white/5 px-4 py-3 text-sm text-slate-200" onClick={() => void duplicateSession(selectedSession.id)}>
                  세션 복제
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-4 text-sm text-slate-400">좌측 목록에서 세션을 선택해 주세요.</div>
          )}
        </section>
      </div>
    </div>
  )
}
