import { useEffect, useMemo, useState } from 'react'
import { CAMERA_CHANNEL_LABELS } from '../../constants'
import { camerasApi, CAMERA_FRAME_INTERVAL_MS } from '../../api/cameras'
import type { CameraChannel, RoiRectangle } from '../../types'
import { LoadingSpinner } from '../common/LoadingSpinner'

const DEFAULT_WIDTH = 1280
const DEFAULT_HEIGHT = 720

export function CameraView({
  channel,
  connected,
  className = '',
  frameWidth = DEFAULT_WIDTH,
  frameHeight = DEFAULT_HEIGHT,
  roi,
}: {
  channel: CameraChannel
  connected: boolean
  className?: string
  frameWidth?: number
  frameHeight?: number
  roi?: RoiRectangle
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
  const aspectRatio = roi
    ? `${Math.max(frameWidth * roi.width, 1)} / ${Math.max(frameHeight * roi.height, 1)}`
    : `${Math.max(frameWidth, 1)} / ${Math.max(frameHeight, 1)}`

  return (
    <div className={`panel-muted relative overflow-hidden ${className}`} style={{ aspectRatio }}>
      <div className="absolute left-3 top-3 z-10 rounded-full bg-slate-950/80 px-2 py-1 text-[11px] text-slate-200">
        {CAMERA_CHANNEL_LABELS[channel]}
      </div>
      <div className="absolute right-3 top-3 z-10 rounded-full bg-slate-950/80 px-2 py-1 text-[11px] text-emerald-300">
        {connected ? 'LIVE 5 FPS' : '연결 안 됨'}
      </div>
      {loading && connected && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-950/35">
          <LoadingSpinner />
        </div>
      )}
      {connected ? (
        roi ? (
          <div className="absolute inset-0 overflow-hidden bg-slate-950">
            <img
              className="absolute max-w-none"
              style={{
                width: `${100 / roi.width}%`,
                height: `${100 / roi.height}%`,
                left: `${-(roi.x / roi.width) * 100}%`,
                top: `${-(roi.y / roi.height) * 100}%`,
              }}
              src={frameUrl}
              alt={CAMERA_CHANNEL_LABELS[channel]}
              onLoad={() => setLoading(false)}
              onError={() => setLoading(false)}
            />
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950">
            <img
              className="h-full w-full object-contain"
              src={frameUrl}
              alt={CAMERA_CHANNEL_LABELS[channel]}
              onLoad={() => setLoading(false)}
              onError={() => setLoading(false)}
            />
          </div>
        )
      ) : (
        <div className="flex h-full min-h-[180px] flex-col items-center justify-center gap-2 text-slate-400">
          <div className="text-3xl">카메라</div>
          <div>{CAMERA_CHANNEL_LABELS[channel]} 연결이 필요합니다.</div>
        </div>
      )}
    </div>
  )
}
