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
          <div className="section-title">Product Overview</div>
          <h1 className="mt-4 text-4xl font-semibold text-slate-50">Robot Learning Tool</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
            Robot Learning Tool는 듀얼암 로봇 작업 학습을 운영하기 위한 통합 제품입니다. 작업 설정, 카메라 영역 관리, 판단 기준 데이터 준비,
            초기 시연 선별, 자동 학습 운영, 결과 비교와 배포까지 하나의 흐름으로 제공합니다.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              ['작업 운영 화면', '학습 실행 전체 단계를 한 화면 흐름으로 관리합니다.'],
              ['실시간 제어 확인', '카메라 화면과 3D 로봇 뷰를 함께 보며 상태를 확인합니다.'],
              ['기록 기반 검토', '시연, 실행 기록, 저장된 모델 비교를 같은 제품 안에서 이어갑니다.'],
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
          <h2 className="mt-4 text-2xl font-semibold text-slate-50">운영 화면 접속</h2>
          <p className="mt-3 text-sm leading-6 text-slate-400">기본 비밀번호는 `1111`입니다.</p>

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
