import { useEffect, useMemo, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { camerasApi, CAMERA_FRAME_INTERVAL_MS } from '../../api/cameras'
import { CAMERA_CHANNEL_LABELS } from '../../constants'
import type { CameraChannel, RoiRectangle } from '../../types'
import { LoadingSpinner } from '../common/LoadingSpinner'

interface RoiEditorCardProps {
  channel: CameraChannel
  roi: RoiRectangle
  connected: boolean
  onSave: (roi: RoiRectangle) => Promise<void>
}

type InteractionState = {
  pointerId: number
  mode: 'move' | 'resize'
  startPointerX: number
  startPointerY: number
  startX: number
  startY: number
  startWidth: number
  startHeight: number
}

export function RoiEditorCard({ channel, roi, connected, onSave }: RoiEditorCardProps) {
  const [cacheKey, setCacheKey] = useState(0)
  const [loading, setLoading] = useState(true)
  const [draftRoi, setDraftRoi] = useState(roi)
  const [saving, setSaving] = useState(false)
  const interactionRef = useRef<InteractionState | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    setDraftRoi(roi)
  }, [roi])

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

  function startInteraction(event: ReactPointerEvent<HTMLDivElement>, mode: InteractionState['mode']) {
    event.preventDefault()
    event.stopPropagation()

    interactionRef.current = {
      pointerId: event.pointerId,
      mode,
      startPointerX: event.clientX,
      startPointerY: event.clientY,
      startX: draftRoi.x,
      startY: draftRoi.y,
      startWidth: draftRoi.width,
      startHeight: draftRoi.height,
    }

    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function handleMovePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    startInteraction(event, 'move')
  }

  function handleResizePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    startInteraction(event, 'resize')
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const container = containerRef.current
    const interaction = interactionRef.current
    if (!container || !interaction || interaction.pointerId !== event.pointerId) {
      return
    }

    const bounds = container.getBoundingClientRect()
    const deltaX = (event.clientX - interaction.startPointerX) / bounds.width
    const deltaY = (event.clientY - interaction.startPointerY) / bounds.height

    if (interaction.mode === 'move') {
      setDraftRoi((previous) => ({
        ...previous,
        x: clamp(interaction.startX + deltaX, 0, 1 - previous.width),
        y: clamp(interaction.startY + deltaY, 0, 1 - previous.height),
      }))
      return
    }

    setDraftRoi((previous) => {
      const width = clamp(interaction.startWidth + deltaX, 0.05, 1 - interaction.startX)
      const height = clamp(interaction.startHeight + deltaY, 0.05, 1 - interaction.startY)
      return {
        ...previous,
        width,
        height,
      }
    })
  }

  async function finishInteraction(event: ReactPointerEvent<HTMLDivElement>) {
    const interaction = interactionRef.current
    if (!interaction || interaction.pointerId !== event.pointerId) {
      return
    }

    interactionRef.current = null
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }

    setSaving(true)
    await onSave(draftRoi)
    setSaving(false)
  }

  return (
    <div className="panel-muted p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm font-semibold text-slate-100">{CAMERA_CHANNEL_LABELS[channel]}</div>
        <div className="text-xs text-slate-400">{saving ? '저장 중...' : '이동 또는 크기 조절'}</div>
      </div>
      <div ref={containerRef} className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-950/80">
        {loading && connected && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-950/35">
            <LoadingSpinner />
          </div>
        )}
        {connected ? (
          <>
            <img
              className="h-[220px] w-full object-cover"
              src={frameUrl}
              alt={CAMERA_CHANNEL_LABELS[channel]}
              onLoad={() => setLoading(false)}
              onError={() => setLoading(false)}
            />
            <div
              className="absolute border-2 border-amber-300 bg-amber-300/10 shadow-[0_0_0_9999px_rgba(2,6,23,0.28)]"
              style={{
                left: `${draftRoi.x * 100}%`,
                top: `${draftRoi.y * 100}%`,
                width: `${draftRoi.width * 100}%`,
                height: `${draftRoi.height * 100}%`,
              }}
              onPointerDown={handleMovePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={finishInteraction}
            >
              <div className="absolute -left-px -top-px bg-amber-300 px-2 py-1 text-[11px] font-semibold text-slate-950">
                ROI
              </div>
              <div
                className="absolute bottom-0 right-0 h-4 w-4 translate-x-1/2 translate-y-1/2 cursor-se-resize rounded-full border-2 border-slate-950 bg-amber-300"
                onPointerDown={handleResizePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={finishInteraction}
              />
            </div>
          </>
        ) : (
          <div className="flex h-[220px] items-center justify-center text-sm text-slate-400">카메라 연결 안 됨</div>
        )}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-300">
        <div className="panel-muted p-2">X: {(draftRoi.x * 100).toFixed(1)}%</div>
        <div className="panel-muted p-2">Y: {(draftRoi.y * 100).toFixed(1)}%</div>
        <div className="panel-muted p-2">W: {(draftRoi.width * 100).toFixed(1)}%</div>
        <div className="panel-muted p-2">H: {(draftRoi.height * 100).toFixed(1)}%</div>
      </div>
    </div>
  )
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}
