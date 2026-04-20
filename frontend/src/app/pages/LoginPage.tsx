import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../constants'
import { useAuthStore } from '../store/authStore'

export function LoginPage() {
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)
  const loginError = useAuthStore((state) => state.loginError)
  const [password, setPassword] = useState('1111')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    const ok = await login(password)
    setSubmitting(false)
    if (ok) {
      navigate(ROUTES.dashboard, { replace: true })
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="grid w-full max-w-5xl gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="panel overflow-hidden p-8">
          <div className="section-title">Mock Prototype</div>
          <h1 className="mt-4 text-4xl font-semibold text-slate-50">Robot Learning Tool Prototype</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
            실제 장비나 학습 알고리즘 대신, 양팔 로봇 학습 세션 운영 UX와 전체 워크플로우를 빠르게 검증하기 위한 웹 기반 프로토타입입니다.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              ['세션 중심 운영', '대시보드부터 평가까지 단일 흐름으로 검증'],
              ['상시 TCP 제어', '우측 패널에서 양팔 수동 조작과 IK 상태 확인'],
              ['Mock 시연 가능', 'API 일부가 미완성이어도 fallback 데이터로 진행'],
            ].map(([title, body]) => (
              <div key={title} className="panel-muted p-4">
                <div className="font-semibold text-slate-100">{title}</div>
                <div className="mt-2 text-sm leading-6 text-slate-400">{body}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="panel p-8">
          <div className="section-title">Login</div>
          <h2 className="mt-4 text-2xl font-semibold text-slate-50">운영 툴 접속</h2>
          <p className="mt-3 text-sm leading-6 text-slate-400">기본 비밀번호는 `1111`이며, 내부망 시연을 가정해 연결 상태는 자동으로 확인됩니다.</p>

          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">비밀번호</span>
              <input
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-slate-100 outline-none ring-0 placeholder:text-slate-500 focus:border-sky-400/50"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="비밀번호를 입력하세요"
              />
            </label>

            {loginError && <div className="rounded-xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{loginError}</div>}

            <button
              className="w-full rounded-2xl bg-sky-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-70"
              type="submit"
              disabled={submitting}
            >
              {submitting ? '접속 중...' : '대시보드로 이동'}
            </button>
          </form>
        </section>
      </div>
    </div>
  )
}
