import { useState } from 'react'
import { FRAME_LABELS, TARGET_LABELS } from '../../constants'
import type { ControlMode, CoordFrame, TcpTarget } from '../../types'
import { useControlStore } from '../../store/controlStore'
import { useSessionStore } from '../../store/sessionStore'
import { StatusBadge } from '../common/StatusBadge'
import { KeyboardHelpModal } from './KeyboardHelpModal'

export function TcpControlPanel() {
  const {
    target,
    mode,
    coordinateFrame,
    stepSize,
    leftTcpPose,
    rightTcpPose,
    leftJoints,
    rightJoints,
    ikSuccess,
    recordingId,
    setTarget,
    setMode,
    setCoordinateFrame,
    setStepSize,
    move,
    reset,
    startRecording,
    stopRecording,
  } = useControlStore()
  const activeSession = useSessionStore((state) => state.activeSession)
  const [helpOpen, setHelpOpen] = useState(false)

  const pose = target === 'right' ? rightTcpPose : leftTcpPose
  const joints = target === 'right' ? rightJoints : leftJoints

  async function handleRecording() {
    if (!activeSession) {
      return
    }

    if (recordingId) {
      await stopRecording()
    } else {
      await startRecording(activeSession.id)
    }
  }

  return (
    <div className="space-y-4">
      <KeyboardHelpModal open={helpOpen} onClose={() => setHelpOpen(false)} />

      <div>
        <div className="mb-2 text-xs text-slate-400">제어 대상</div>
        <div className="grid grid-cols-3 gap-2">
          {(['left', 'right', 'both'] as TcpTarget[]).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => void setTarget(item)}
              className={`rounded-xl px-3 py-2 text-sm ${target === item ? 'bg-sky-500 text-white' : 'bg-white/5 text-slate-300'}`}
            >
              {TARGET_LABELS[item]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="mb-2 text-xs text-slate-400">조작 모드</div>
          <div className="grid grid-cols-2 gap-2">
            {(['move', 'rotate'] as ControlMode[]).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setMode(item)}
                className={`rounded-xl px-3 py-2 text-sm ${mode === item ? 'bg-cyan-500 text-white' : 'bg-white/5 text-slate-300'}`}
              >
                {item === 'move' ? '이동' : '회전'}
              </button>
            ))}
          </div>
        </div>
        <div>
          <div className="mb-2 text-xs text-slate-400">좌표계</div>
          <div className="grid grid-cols-2 gap-2">
            {(['world', 'local'] as CoordFrame[]).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setCoordinateFrame(item)}
                className={`rounded-xl px-3 py-2 text-sm ${coordinateFrame === item ? 'bg-indigo-500 text-white' : 'bg-white/5 text-slate-300'}`}
              >
                {FRAME_LABELS[item]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
          <span>Step Size</span>
          <span>{stepSize.toFixed(3)}</span>
        </div>
        <input
          className="w-full accent-sky-400"
          type="range"
          min={0.001}
          max={0.1}
          step={0.001}
          value={stepSize}
          onChange={(event) => setStepSize(Number(event.target.value))}
        />
      </div>

      <div className="grid grid-cols-3 gap-2 text-sm">
        <button className="rounded-xl bg-white/5 px-3 py-2" onClick={() => void move(target, 0, 0, stepSize)}>
          +Z
        </button>
        <button className="rounded-xl bg-white/5 px-3 py-2" onClick={() => void move(target, stepSize, 0, 0)}>
          +X
        </button>
        <button className="rounded-xl bg-white/5 px-3 py-2" onClick={() => void move(target, 0, stepSize, 0)}>
          +Y
        </button>
        <button className="rounded-xl bg-white/5 px-3 py-2" onClick={() => void move(target, 0, 0, -stepSize)}>
          -Z
        </button>
        <button className="rounded-xl bg-white/5 px-3 py-2" onClick={() => void move(target, -stepSize, 0, 0)}>
          -X
        </button>
        <button className="rounded-xl bg-white/5 px-3 py-2" onClick={() => void move(target, 0, -stepSize, 0)}>
          -Y
        </button>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <button className="rounded-xl bg-emerald-500/80 px-3 py-2 text-sm font-medium text-white" onClick={() => void handleRecording()}>
          {recordingId ? '기록 종료' : '기록 시작'}
        </button>
        <button className="rounded-xl bg-white/5 px-3 py-2 text-sm text-slate-300" onClick={() => void reset()}>
          TCP 초기화
        </button>
      </div>

      <button className="w-full rounded-xl border border-white/10 px-3 py-2 text-sm text-slate-300" onClick={() => setHelpOpen(true)}>
        키보드 도움말 보기
      </button>

      {ikSuccess !== null && <StatusBadge tone={ikSuccess ? 'success' : 'danger'}>{ikSuccess ? 'IK 성공' : 'IK 실패'}</StatusBadge>}

      {pose && (
        <div>
          <div className="mb-2 text-xs text-slate-400">현재 TCP Pose</div>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(pose).map(([key, value]) => (
              <div key={key} className="panel-muted p-2">
                <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">{key}</div>
                <div className="mt-1 text-sm font-medium text-slate-100">{value.toFixed(3)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {joints.length > 0 && (
        <div>
          <div className="mb-2 text-xs text-slate-400">현재 Joint State</div>
          <div className="grid grid-cols-3 gap-2">
            {joints.map((joint, index) => (
              <div key={`${index}-${joint}`} className="panel-muted p-2">
                <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">J{index + 1}</div>
                <div className="mt-1 text-sm font-medium text-slate-100">{joint.toFixed(2)}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
