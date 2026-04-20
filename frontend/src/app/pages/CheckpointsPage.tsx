import { useEffect, useState } from 'react'
import { checkpointsApi } from '../api/checkpoints'
import type { Checkpoint } from '../types'

export function CheckpointsPage() {
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([])

  useEffect(() => {
    void checkpointsApi.getAll().then(setCheckpoints)
  }, [])

  return (
    <div className="space-y-6">
      <section className="panel p-6">
        <div className="section-title">모델 / 체크포인트</div>
        <h1 className="mt-3 text-3xl font-semibold text-slate-50">추가 학습 시작점을 관리합니다.</h1>
      </section>

      <section className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {checkpoints.map((checkpoint) => (
          <div key={checkpoint.id} className="panel p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-lg font-semibold text-slate-100">{checkpoint.name}</div>
                <div className="mt-1 text-sm text-slate-400">{new Date(checkpoint.createdAt).toLocaleString()}</div>
              </div>
              {checkpoint.isBaseForAdditional && <span className="rounded-full bg-amber-500/20 px-3 py-1 text-xs text-amber-200">추가 학습 시작점</span>}
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <div className="panel-muted p-3 text-sm text-slate-300">성공률 {Math.round(checkpoint.successRate * 100)}%</div>
              <div className="panel-muted p-3 text-sm text-slate-300">평균 시간 {checkpoint.averageDuration.toFixed(1)}초</div>
              <div className="panel-muted p-3 text-sm text-slate-300">에피소드 {checkpoint.totalEpisodes}</div>
            </div>
          </div>
        ))}
      </section>
    </div>
  )
}
