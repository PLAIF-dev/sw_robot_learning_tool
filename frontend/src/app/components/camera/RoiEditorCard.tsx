import { useEffect, useMemo, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { camerasApi, CAMERA_FRAME_INTERVAL_MS } from '../../api/cameras'
import { CAMERA_CHANNEL_LABELS } from '../../constants'
import { useDeviceStore } from '../../store/deviceStore'
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
  const status = useDeviceStore((state) => state.status)
  const [cacheKey, setCacheKey] = useState(0)
  const [loading, setLoading] = useState(true)
  const [draftRoi, setDraftRoi] = useState(roi)
  const [saving, setSaving] = useState(false)
  const draftRoiRef = useRef(roi)
  const interactionRef = useRef<InteractionState | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    setDraftRoi(roi)
    draftRoiRef.current = roi
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
  const { width, height } = getFrameSize(channel, status)

  function startInteraction(event: ReactPointerEvent<HTMLDivElement>, mode: InteractionState['mode']) {
    event.preventDefault()
    event.stopPropagation()

    interactionRef.current = {
      pointerId: event.pointerId,
      mode,
      startPointerX: event.clientX,
      startPointerY: event.clientY,
      startX: draftRoiRef.current.x,
      startY: draftRoiRef.current.y,
      startWidth: draftRoiRef.current.width,
      startHeight: draftRoiRef.current.height,
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
      updateDraftRoi((previous) => ({
        ...snapMovedEdges(
          clamp(interaction.startX + deltaX, 0, 1 - previous.width),
          clamp(interaction.startY + deltaY, 0, 1 - previous.height),
          previous.width,
          previous.height,
        ),
      }))
      return
    }

    updateDraftRoi(() => {
      const widthValue = clamp(interaction.startWidth + deltaX, 0.05, 1 - interaction.startX)
      const heightValue = clamp(interaction.startHeight + deltaY, 0.05, 1 - interaction.startY)
      return snapResizedEdges(interaction.startX, interaction.startY, widthValue, heightValue)
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
    await onSave(draftRoiRef.current)
    setSaving(false)
  }

  function updateDraftRoi(update: (previous: RoiRectangle) => Partial<RoiRectangle>) {
    setDraftRoi((previous) => {
      const next = {
        ...previous,
        ...update(previous),
      }
      draftRoiRef.current = next
      return next
    })
  }

  function setFullFrameRoi() {
    const fullFrame = {
      channel,
      x: 0,
      y: 0,
      width: 1,
      height: 1,
    } satisfies RoiRectangle

    draftRoiRef.current = fullFrame
    setDraftRoi(fullFrame)
    setSaving(true)
    void onSave(fullFrame).finally(() => setSaving(false))
  }

  return (
    <div className="panel-muted p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm font-semibold text-slate-100">{CAMERA_CHANNEL_LABELS[channel]}</div>
        <div className="text-xs text-slate-400">{saving ? '저장 중...' : '박스를 움직이거나 크기를 조절하세요'}</div>
      </div>
      <div
        ref={containerRef}
        className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-950/80"
        style={{ aspectRatio: `${Math.max(width, 1)} / ${Math.max(height, 1)}` }}
      >
        {loading && connected && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-950/35">
            <LoadingSpinner />
          </div>
        )}
        {connected ? (
          <>
            <div className="absolute inset-0 flex items-center justify-center bg-slate-950">
              <img
                className="h-full w-full object-contain"
                src={frameUrl}
                alt={CAMERA_CHANNEL_LABELS[channel]}
                onLoad={() => setLoading(false)}
                onError={() => setLoading(false)}
              />
            </div>
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
          <div className="flex h-full items-center justify-center text-sm text-slate-400">카메라 연결이 필요합니다.</div>
        )}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-300">
        <div className="panel-muted p-2">X: {(draftRoi.x * 100).toFixed(1)}%</div>
        <div className="panel-muted p-2">Y: {(draftRoi.y * 100).toFixed(1)}%</div>
        <div className="panel-muted p-2">W: {(draftRoi.width * 100).toFixed(1)}%</div>
        <div className="panel-muted p-2">H: {(draftRoi.height * 100).toFixed(1)}%</div>
      </div>
      <div className="mt-3 flex justify-end">
        <button className="rounded-xl bg-white/10 px-3 py-2 text-xs font-medium text-slate-200" onClick={setFullFrameRoi} type="button">
          전체 영역
        </button>
      </div>
    </div>
  )
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function snapMovedEdges(x: number, y: number, width: number, height: number) {
  return {
    x: snapToEdge(x, width),
    y: snapToEdge(y, height),
  }
}

function snapResizedEdges(x: number, y: number, width: number, height: number) {
  const snapped = {
    x,
    y,
    width,
    height,
  }

  if (x <= EDGE_SNAP_THRESHOLD && x + width >= 1 - EDGE_SNAP_THRESHOLD) {
    snapped.x = 0
    snapped.width = 1
  } else if (x + width >= 1 - EDGE_SNAP_THRESHOLD) {
    snapped.width = 1 - x
  }

  if (y <= EDGE_SNAP_THRESHOLD && y + height >= 1 - EDGE_SNAP_THRESHOLD) {
    snapped.y = 0
    snapped.height = 1
  } else if (y + height >= 1 - EDGE_SNAP_THRESHOLD) {
    snapped.height = 1 - y
  }

  return snapped
}

function snapToEdge(position: number, size: number) {
  if (position <= EDGE_SNAP_THRESHOLD) {
    return 0
  }

  if (position + size >= 1 - EDGE_SNAP_THRESHOLD) {
    return 1 - size
  }

  return position
}

const EDGE_SNAP_THRESHOLD = 0.03

function getFrameSize(channel: CameraChannel, status: ReturnType<typeof useDeviceStore.getState>['status']) {
  switch (channel) {
    case 'left':
      return { width: status?.leftCamera.width ?? 640, height: status?.leftCamera.height ?? 480 }
    case 'right':
      return { width: status?.rightCamera.width ?? 640, height: status?.rightCamera.height ?? 480 }
    case 'head':
      return { width: status?.headCamera.width ?? 1280, height: status?.headCamera.height ?? 720 }
  }
}
