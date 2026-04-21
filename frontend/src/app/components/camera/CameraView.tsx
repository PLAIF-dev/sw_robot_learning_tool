import { useEffect, useMemo, useState } from 'react'
import { CAMERA_CHANNEL_LABELS } from '../../constants'
import { camerasApi, CAMERA_FRAME_INTERVAL_MS } from '../../api/cameras'
import type { CameraChannel } from '../../types'
import { LoadingSpinner } from '../common/LoadingSpinner'

export function CameraView({
  channel,
  connected,
  className = '',
}: {
  channel: CameraChannel
  connected: boolean
  className?: string
}) {
  const [cacheKey, setCacheKey] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!connected) {
      setLoading(false)
      return
    }

    setLoading(true)
    const timer = window.setInterval(() => {
      setCacheKey((current) => current + 1)
    }, CAMERA_FRAME_INTERVAL_MS)

    return () => window.clearInterval(timer)
  }, [connected, channel])

  const frameUrl = useMemo(() => camerasApi.getFrameUrl(channel, cacheKey), [channel, cacheKey])

  return (
    <div className={`panel-muted relative min-h-[180px] overflow-hidden ${className}`}>
      <div className="absolute left-3 top-3 z-10 rounded-full bg-slate-950/80 px-2 py-1 text-[11px] text-slate-200">
        {CAMERA_CHANNEL_LABELS[channel]}
      </div>
      <div className="absolute right-3 top-3 z-10 rounded-full bg-slate-950/80 px-2 py-1 text-[11px] text-emerald-300">
        {connected ? 'LIVE 5 FPS' : 'OFF'}
      </div>
      {loading && connected && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-950/35">
          <LoadingSpinner />
        </div>
      )}
      {connected ? (
        <img
          className="h-full min-h-[180px] w-full object-cover"
          src={frameUrl}
          alt={CAMERA_CHANNEL_LABELS[channel]}
          onLoad={() => setLoading(false)}
          onError={() => setLoading(false)}
        />
      ) : (
        <div className="flex h-full min-h-[180px] flex-col items-center justify-center gap-2 text-slate-400">
          <div className="text-3xl">▣</div>
          <div>{CAMERA_CHANNEL_LABELS[channel]} 연결 안 됨</div>
        </div>
      )}
    </div>
  )
}
