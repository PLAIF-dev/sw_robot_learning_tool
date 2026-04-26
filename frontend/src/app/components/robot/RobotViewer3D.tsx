import { useEffect, useRef, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { Grid, OrbitControls } from '@react-three/drei'
import type { TcpPose, TcpTarget } from '../../types'
import { useControlStore } from '../../store/controlStore'
import { URDFViewer } from './URDFViewer'
import { buildJointAngles, URDF_URL } from './robotModel'

const JOINT_JOG_STEP = 0.15
const JOINT_COUNT = 6
const JOINT_JOG_REPEAT_MS = 80

const TARGET_LABELS: Record<TcpTarget, string> = {
  left: 'Left TCP',
  right: 'Right TCP',
  both: 'Both TCPs',
}

export function RobotViewer3D({
  leftJoints,
  rightJoints,
  leftTcpPose,
  rightTcpPose,
  selectedTarget,
  className = '',
}: {
  leftJoints: number[]
  rightJoints: number[]
  leftTcpPose: TcpPose | null
  rightTcpPose: TcpPose | null
  selectedTarget: TcpTarget
  className?: string
}) {
  const jogJoint = useControlStore((state) => state.jogJoint)
  const repeatTimerRef = useRef<number | null>(null)
  const inFlightRef = useRef(false)
  const jointAngles = useMemo(() => buildJointAngles(leftJoints, rightJoints), [leftJoints, rightJoints])
  const overlayItems = useMemo(() => {
    const buildSection = (label: string, tcpPose: TcpPose | null, joints: number[], target: 'left' | 'right') => ({
      label,
      tcpPose,
      joints,
      target,
    })

    return [
      buildSection('Left TCP', leftTcpPose, leftJoints, 'left'),
      buildSection('Right TCP', rightTcpPose, rightJoints, 'right'),
    ]
  }, [leftJoints, leftTcpPose, rightJoints, rightTcpPose])

  useEffect(() => () => {
    if (repeatTimerRef.current !== null) {
      window.clearInterval(repeatTimerRef.current)
    }
  }, [])

  function stopJointJog() {
    if (repeatTimerRef.current !== null) {
      window.clearInterval(repeatTimerRef.current)
      repeatTimerRef.current = null
    }
  }

  async function runJointJog(target: 'left' | 'right', jointIndex: number, delta: number) {
    if (inFlightRef.current) {
      return
    }

    inFlightRef.current = true
    try {
      await jogJoint(target, jointIndex, delta)
    } finally {
      inFlightRef.current = false
    }
  }

  function startJointJog(target: 'left' | 'right', jointIndex: number, delta: number) {
    stopJointJog()
    void runJointJog(target, jointIndex, delta)
    repeatTimerRef.current = window.setInterval(() => {
      void runJointJog(target, jointIndex, delta)
    }, JOINT_JOG_REPEAT_MS)
  }

  return (
    <div className={`panel-muted relative overflow-hidden ${className || 'h-[480px]'}`}>
      <Canvas camera={{ position: [2.5, 1.8, 2.5], fov: 45 }} shadows>
        <ambientLight intensity={0.55} />
        <directionalLight position={[3, 4, 2]} intensity={1.15} castShadow />
        <directionalLight position={[-2, 2, -2]} intensity={0.35} />
        <URDFViewer url={URDF_URL} jointAngles={jointAngles} />
        <Grid
          args={[6, 6]}
          position={[0, -0.01, 0]}
          infiniteGrid
          cellColor="#1e293b"
          sectionColor="#334155"
          fadeDistance={10}
        />
        <OrbitControls makeDefault enablePan target={[0, 0.8, 0]} />
      </Canvas>

      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-center gap-2 px-3 py-2 text-[11px]">
        <span className="rounded-full bg-slate-950/80 px-2.5 py-0.5 text-slate-200">
          dual_rb3_730e_ver3
        </span>
        <span className="rounded-full bg-sky-500/20 px-2.5 py-0.5 text-sky-200">
          {TARGET_LABELS[selectedTarget]}
        </span>
      </div>

      {overlayItems.map((item) => (
        <div
          key={item.label}
          className={`pointer-events-auto absolute top-10 z-10 w-[200px] rounded-2xl border border-white/10 bg-slate-950/80 p-2.5 text-[11px] text-slate-200 shadow-lg backdrop-blur-sm ${item.target === 'left' ? 'left-3' : 'right-3'}`}
        >
          <div className="text-xs font-semibold text-sky-200">{item.label}</div>
          <div className="mt-1.5 text-[10px] uppercase tracking-[0.16em] text-slate-400">TCP Pose</div>
          <div className="mt-1 grid grid-cols-2 gap-x-2 gap-y-0.5">
            {item.tcpPose
              ? Object.entries(item.tcpPose).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between gap-1">
                  <span className="text-slate-400">{key}</span>
                  <span className="font-mono text-slate-100">{value.toFixed(2)}</span>
                </div>
              ))
              : <div className="col-span-2 text-slate-500">No pose</div>}
          </div>
          <div className="mt-2 text-[10px] uppercase tracking-[0.16em] text-slate-400">Joint Pose</div>
          <div className="mt-1 space-y-0.5">
            {Array.from({ length: JOINT_COUNT }, (_, index) => item.joints[index] ?? 0).map((joint, index) => (
              <div key={`${item.label}-${index}`} className="flex items-center justify-between gap-1">
                <span className="w-6 text-slate-400">J{index + 1}</span>
                <button
                  type="button"
                  className="rounded border border-white/10 bg-white/5 px-1.5 py-0 leading-5 text-slate-200 transition hover:bg-white/10"
                  onPointerDown={(event) => {
                    event.preventDefault()
                    event.stopPropagation()
                    startJointJog(item.target, index, -JOINT_JOG_STEP)
                  }}
                  onPointerUp={stopJointJog}
                  onPointerCancel={stopJointJog}
                  onPointerLeave={stopJointJog}
                >
                  -
                </button>
                <span className="min-w-[48px] text-right font-mono text-slate-100">{joint.toFixed(2)}</span>
                <button
                  type="button"
                  className="rounded border border-white/10 bg-white/5 px-1.5 py-0 leading-5 text-slate-200 transition hover:bg-white/10"
                  onPointerDown={(event) => {
                    event.preventDefault()
                    event.stopPropagation()
                    startJointJog(item.target, index, JOINT_JOG_STEP)
                  }}
                  onPointerUp={stopJointJog}
                  onPointerCancel={stopJointJog}
                  onPointerLeave={stopJointJog}
                >
                  +
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
