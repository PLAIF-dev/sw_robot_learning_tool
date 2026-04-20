import { useEffect, useMemo, useState } from 'react'
import { recordsApi } from '../api/records'
import type { DemoRecord, EpisodeRecord, InterventionRecord, MotionRecord, PlaybackFrame, ReviewTab } from '../types'

export function ReviewPage() {
  const [tab, setTab] = useState<ReviewTab>('motion')
  const [motion, setMotion] = useState<MotionRecord[]>([])
  const [demos, setDemos] = useState<DemoRecord[]>([])
  const [episodes, setEpisodes] = useState<EpisodeRecord[]>([])
  const [interventions, setInterventions] = useState<InterventionRecord[]>([])
  const [playback, setPlayback] = useState<PlaybackFrame[]>([])
  const [frameIndex, setFrameIndex] = useState(0)

  useEffect(() => {
    void Promise.all([
      recordsApi.getMotion().then(setMotion),
      recordsApi.getDemos().then(setDemos),
      recordsApi.getEpisodes().then(setEpisodes),
      recordsApi.getInterventions().then(setInterventions),
    ])
  }, [])

  const currentFrame = playback[frameIndex] ?? null

  const list = useMemo(() => {
    switch (tab) {
      case 'motion':
        return motion
      case 'demos':
        return demos
      case 'episodes':
        return episodes
      case 'interventions':
        return interventions
    }
  }, [demos, episodes, interventions, motion, tab])

  async function loadPlayback(id: string) {
    setFrameIndex(0)
    if (tab === 'motion') setPlayback(await recordsApi.getMotionPlayback(id))
    if (tab === 'demos') setPlayback(await recordsApi.getDemoPlayback(id))
    if (tab === 'episodes') setPlayback(await recordsApi.getEpisodePlayback(id))
    if (tab === 'interventions') setPlayback(await recordsApi.getInterventionPlayback(id))
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <section className="panel p-6">
        <div className="section-title">기록 검토</div>
        <div className="mt-4 flex flex-wrap gap-2">
          {[
            ['motion', '수동 조작 기록'],
            ['demos', '데모 기록'],
            ['episodes', '에피소드 기록'],
            ['interventions', '개입 기록'],
          ].map(([key, label]) => (
            <button
              key={key}
              className={`rounded-2xl px-4 py-2 text-sm ${tab === key ? 'bg-sky-500 text-white' : 'bg-white/5 text-slate-300'}`}
              onClick={() => setTab(key as ReviewTab)}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="mt-4 space-y-3">
          {list.map((item) => (
            <button key={(item as { id: string }).id} className="panel-muted flex w-full items-center justify-between p-4 text-left" onClick={() => void loadPlayback((item as { id: string }).id)}>
              <div>
                <div className="font-medium text-slate-100">{(item as { id: string }).id}</div>
                <div className="mt-1 text-sm text-slate-400">{JSON.stringify(item)}</div>
              </div>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-300">재생</span>
            </button>
          ))}
        </div>
      </section>

      <section className="panel p-6">
        <div className="section-title">재생 패널</div>
        {currentFrame ? (
          <div className="mt-4 space-y-4">
            <input
              className="w-full accent-sky-400"
              type="range"
              min={0}
              max={Math.max(playback.length - 1, 0)}
              value={frameIndex}
              onChange={(event) => setFrameIndex(Number(event.target.value))}
            />
            <div className="panel-muted p-4 text-sm text-slate-300">Time Offset: {currentFrame.timeOffset.toFixed(2)}s</div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="panel-muted p-4">
                <div className="font-semibold text-slate-100">Left TCP</div>
                <pre className="mt-3 whitespace-pre-wrap text-xs text-slate-300">{JSON.stringify(currentFrame.leftTcp, null, 2)}</pre>
              </div>
              <div className="panel-muted p-4">
                <div className="font-semibold text-slate-100">Right TCP</div>
                <pre className="mt-3 whitespace-pre-wrap text-xs text-slate-300">{JSON.stringify(currentFrame.rightTcp, null, 2)}</pre>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="panel-muted p-4">
                <div className="font-semibold text-slate-100">Left Joints</div>
                <div className="mt-3 text-xs text-slate-300">{currentFrame.leftJoints.map((joint) => joint.toFixed(2)).join(', ')}</div>
              </div>
              <div className="panel-muted p-4">
                <div className="font-semibold text-slate-100">Right Joints</div>
                <div className="mt-3 text-xs text-slate-300">{currentFrame.rightJoints.map((joint) => joint.toFixed(2)).join(', ')}</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-4 text-sm text-slate-400">좌측 목록에서 기록을 선택하면 타임라인 scrub UI와 현재 프레임 정보가 표시됩니다.</div>
        )}
      </section>
    </div>
  )
}
