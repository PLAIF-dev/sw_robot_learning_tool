import { useEffect, useMemo, useState } from 'react'
import { checkpointsApi } from '../api/checkpoints'
import type { Checkpoint } from '../types'

export function CheckpointsPage() {
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([])

  useEffect(() => {
    void checkpointsApi.getAll().then(setCheckpoints)
  }, [])

  const recommendedId = useMemo(() => {
    if (checkpoints.length === 0) {
      return null
    }

    return [...checkpoints].sort((left, right) => {
      if (right.successRate !== left.successRate) {
        return right.successRate - left.successRate
      }
      return left.averageDuration - right.averageDuration
    })[0].id
  }, [checkpoints])

  return (
    <div className="space-y-6">
      <section className="panel p-6">
        <div className="section-title">저장된 모델</div>
        <h1 className="mt-3 text-3xl font-semibold text-slate-50">학습으로 저장된 모델과 비교 결과를 관리합니다.</h1>
      </section>

      <section className="panel overflow-hidden">
        <table className="min-w-full divide-y divide-white/10 text-left text-sm text-slate-200">
          <thead className="bg-white/5 text-slate-400">
            <tr>
              <th className="px-6 py-4 font-medium">모델 이름</th>
              <th className="px-6 py-4 font-medium">저장 시각</th>
              <th className="px-6 py-4 font-medium">성공 비율</th>
              <th className="px-6 py-4 font-medium">평균 시간</th>
              <th className="px-6 py-4 font-medium">누적 실행</th>
              <th className="px-6 py-4 font-medium">상태</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {checkpoints.map((checkpoint) => (
              <tr key={checkpoint.id}>
                <td className="px-6 py-4 font-semibold text-slate-100">{checkpoint.name}</td>
                <td className="px-6 py-4">{new Date(checkpoint.createdAt).toLocaleString('ko-KR')}</td>
                <td className="px-6 py-4">{Math.round(checkpoint.successRate * 100)}%</td>
                <td className="px-6 py-4">{checkpoint.averageDuration.toFixed(1)}초</td>
                <td className="px-6 py-4">{checkpoint.totalEpisodes}</td>
                <td className="px-6 py-4">
                  {recommendedId === checkpoint.id ? (
                    <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs text-emerald-200">추천</span>
                  ) : checkpoint.isBaseForAdditional ? (
                    <span className="rounded-full bg-amber-500/20 px-3 py-1 text-xs text-amber-200">추가 학습 기준</span>
                  ) : (
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-300">비교 가능</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}
