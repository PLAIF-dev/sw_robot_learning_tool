import { useEffect, useState } from 'react'
import { dashboardApi } from '../api/dashboard'
import type { DashboardSummary } from '../types'
import { StatusBadge } from '../components/common/StatusBadge'

export function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null)

  useEffect(() => {
    void dashboardApi.getSummary().then(setSummary)
  }, [])

  return (
    <div className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="panel p-6">
          <div className="section-title">대시보드</div>
          <h1 className="mt-3 text-3xl font-semibold text-slate-50">현재 학습 운영 상태</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
            최근 세션, 장치 연결 상태, 체크포인트, 데모/에피소드 지표를 한눈에 보고 빠르게 학습 실행으로 이동할 수 있습니다.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-4">
            <div className="panel-muted p-4">
              <div className="section-title">활성 세션</div>
              <div className="metric-value mt-3">{summary?.activeSession?.name ?? '없음'}</div>
            </div>
            <div className="panel-muted p-4">
              <div className="section-title">최근 데모</div>
              <div className="metric-value mt-3">{summary?.recentDemoCount ?? 0}</div>
            </div>
            <div className="panel-muted p-4">
              <div className="section-title">에피소드</div>
              <div className="metric-value mt-3">{summary?.recentEpisodeCount ?? 0}</div>
            </div>
            <div className="panel-muted p-4">
              <div className="section-title">성공률</div>
              <div className="metric-value mt-3">{Math.round((summary?.overallSuccessRate ?? 0) * 100)}%</div>
            </div>
          </div>
        </div>

        <div className="panel p-6">
          <div className="section-title">빠른 시작</div>
          <div className="mt-4 space-y-3">
            {[
              '1. 세션에서 현재 작업 세션을 활성화합니다.',
              '2. 학습 실행에서 기본 환경 설정과 Classifier 수집을 점검합니다.',
              '3. 우측 패널의 TCP 수동 조작으로 양팔 TCP를 미세 조정합니다.',
              '4. 데모 수집 또는 본 학습으로 넘어가 시연 흐름을 완성합니다.',
            ].map((line) => (
              <div key={line} className="panel-muted p-3 text-sm text-slate-300">
                {line}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <div className="panel p-6 xl:col-span-2">
          <div className="section-title">최근 세션 목록</div>
          <div className="mt-4 grid gap-3">
            {summary?.recentSessions.map((session) => (
              <div key={session.id} className="panel-muted flex items-center justify-between p-4">
                <div>
                  <div className="font-semibold text-slate-100">{session.name}</div>
                  <div className="mt-1 text-sm text-slate-400">{session.currentStage}</div>
                </div>
                <div className="flex gap-2">
                  <StatusBadge tone={session.mode === 'NewTraining' ? 'info' : 'warning'}>
                    {session.mode === 'NewTraining' ? '신규 학습' : '추가 학습'}
                  </StatusBadge>
                  {session.isActive && <StatusBadge tone="success">활성</StatusBadge>}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel p-6">
          <div className="section-title">최근 체크포인트</div>
          {summary?.latestCheckpoint ? (
            <div className="mt-4 panel-muted p-4">
              <div className="font-semibold text-slate-100">{summary.latestCheckpoint.name}</div>
              <div className="mt-2 text-sm text-slate-400">성공률 {Math.round(summary.latestCheckpoint.successRate * 100)}%</div>
              <div className="mt-1 text-sm text-slate-400">평균 시간 {summary.latestCheckpoint.averageDuration.toFixed(1)}초</div>
            </div>
          ) : (
            <div className="mt-4 text-sm text-slate-400">체크포인트가 없습니다.</div>
          )}
        </div>
      </section>
    </div>
  )
}
