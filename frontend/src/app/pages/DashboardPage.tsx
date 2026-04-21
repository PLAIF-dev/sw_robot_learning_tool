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
            최근 작업, 장치 연결 상태, 체크포인트, 데모와 에피소드 지표를 한눈에 보고 빠르게 학습 실행으로 이동할 수 있습니다.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-4">
            <div className="panel-muted p-4">
              <div className="section-title">활성 작업</div>
              <div className="metric-value mt-3">{summary?.activeTask?.name ?? '없음'}</div>
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
              '1. 작업 화면에서 현재 작업을 활성화합니다.',
              '2. 학습 실행에서 기본 환경 설정과 Classifier 샘플 수집을 점검합니다.',
              '3. 카메라 ROI를 확인한 뒤 데모 수집이나 본 학습으로 넘어갑니다.',
              '4. 완료 후 체크포인트를 확인하고 운영 페이지에서 현황을 점검합니다.',
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
          <div className="section-title">최근 작업 목록</div>
          <div className="mt-4 grid gap-3">
            {summary?.recentTasks.map((taskItem) => (
              <div key={taskItem.id} className="panel-muted flex items-center justify-between p-4">
                <div>
                  <div className="font-semibold text-slate-100">{taskItem.name}</div>
                  <div className="mt-1 text-sm text-slate-400">{taskItem.currentStage}</div>
                </div>
                <div className="flex gap-2">
                  <StatusBadge tone={taskItem.mode === 'NewTraining' ? 'info' : 'warning'}>
                    {taskItem.mode === 'NewTraining' ? '신규 작업' : '추가 작업'}
                  </StatusBadge>
                  {taskItem.isActive && <StatusBadge tone="success">활성</StatusBadge>}
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
