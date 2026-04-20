import { useEffect, useState } from 'react'
import { camerasApi } from '../../api/cameras'
import { CAMERA_CHANNEL_LABELS } from '../../constants'
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
  const [frame, setFrame] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true

    async function load() {
      if (!connected) {
        setLoading(false)
        return
      }

      const nextFrame = await camerasApi.getFrame(channel)
      if (alive) {
        setFrame(nextFrame)
        setLoading(false)
      }
    }

    void load()
    const timer = window.setInterval(load, 2000)
    return () => {
      alive = false
      window.clearInterval(timer)
    }
  }, [channel, connected])

  return (
    <div className={`panel-muted relative min-h-[180px] overflow-hidden ${className}`}>
      <div className="absolute left-3 top-3 rounded-full bg-slate-950/80 px-2 py-1 text-[11px] text-slate-200">
        {CAMERA_CHANNEL_LABELS[channel]}
      </div>
      <div className="absolute right-3 top-3 rounded-full bg-slate-950/80 px-2 py-1 text-[11px] text-emerald-300">
        {connected ? 'LIVE' : 'OFF'}
      </div>
      {loading ? (
        <div className="flex h-full min-h-[180px] items-center justify-center">
          <LoadingSpinner />
        </div>
      ) : connected && frame ? (
        <img className="h-full min-h-[180px] w-full object-cover" src={`data:image/png;base64,${frame}`} alt={CAMERA_CHANNEL_LABELS[channel]} />
      ) : (
        <div className="flex h-full min-h-[180px] flex-col items-center justify-center gap-2 text-slate-400">
          <div className="text-3xl">▣</div>
          <div>{CAMERA_CHANNEL_LABELS[channel]} 연결 안 됨</div>
        </div>
      )}
    </div>
  )
}
