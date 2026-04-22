import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { Grid, OrbitControls } from '@react-three/drei'
import { URDFViewer } from '../components/robot/URDFViewer'

const URDF_URL = '/robots/dual_rb3_730e_ver3.urdf'

type JointDef = { name: string; label: string; min: number; max: number }

const LEFT_JOINTS: JointDef[] = [
  { name: 'dual_rb3_730e_ver3_left_base_joint',     label: 'Base',     min: -6.2832, max: 6.2832 },
  { name: 'dual_rb3_730e_ver3_left_shoulder_joint', label: 'Shoulder', min: -6.2832, max: 6.2832 },
  { name: 'dual_rb3_730e_ver3_left_elbow_joint',    label: 'Elbow',    min: -2.618,  max: 2.618  },
  { name: 'dual_rb3_730e_ver3_left_wrist1_joint',   label: 'Wrist 1',  min: -6.2832, max: 6.2832 },
  { name: 'dual_rb3_730e_ver3_left_wrist2_joint',   label: 'Wrist 2',  min: -6.2832, max: 6.2832 },
  { name: 'dual_rb3_730e_ver3_left_wrist3_joint',   label: 'Wrist 3',  min: -6.2832, max: 6.2832 },
]

const RIGHT_JOINTS: JointDef[] = [
  { name: 'dual_rb3_730e_ver3_right_base_joint',     label: 'Base',     min: -6.2832, max: 6.2832 },
  { name: 'dual_rb3_730e_ver3_right_shoulder_joint', label: 'Shoulder', min: -6.2832, max: 6.2832 },
  { name: 'dual_rb3_730e_ver3_right_elbow_joint',    label: 'Elbow',    min: -2.618,  max: 2.618  },
  { name: 'dual_rb3_730e_ver3_right_wrist1_joint',   label: 'Wrist 1',  min: -6.2832, max: 6.2832 },
  { name: 'dual_rb3_730e_ver3_right_wrist2_joint',   label: 'Wrist 2',  min: -6.2832, max: 6.2832 },
  { name: 'dual_rb3_730e_ver3_right_wrist3_joint',   label: 'Wrist 3',  min: -6.2832, max: 6.2832 },
]

const ALL_JOINTS = [...LEFT_JOINTS, ...RIGHT_JOINTS]

function buildZeroAngles() {
  return Object.fromEntries(ALL_JOINTS.map((j) => [j.name, 0]))
}

function JointSlider({
  def,
  value,
  onChange,
}: {
  def: JointDef
  value: number
  onChange: (name: string, rad: number) => void
}) {
  const deg = Math.round((value * 180) / Math.PI)
  const minDeg = Math.round((def.min * 180) / Math.PI)
  const maxDeg = Math.round((def.max * 180) / Math.PI)

  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-300">{def.label}</span>
        <span className="font-mono text-sky-400">{deg}°</span>
      </div>
      <input
        type="range"
        min={minDeg}
        max={maxDeg}
        step={1}
        value={deg}
        onChange={(e) => onChange(def.name, (Number(e.target.value) * Math.PI) / 180)}
        className="w-full accent-sky-500"
      />
    </div>
  )
}

export function RobotViewerPage() {
  const [jointAngles, setJointAngles] = useState<Record<string, number>>(buildZeroAngles)

  function setJoint(name: string, rad: number) {
    setJointAngles((prev) => ({ ...prev, [name]: rad }))
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] gap-0 overflow-hidden rounded-2xl border border-white/10">
      {/* Joint control sidebar */}
      <aside className="flex w-60 shrink-0 flex-col gap-4 overflow-y-auto border-r border-white/10 bg-slate-900 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-100">조인트 제어</h2>
          <button
            type="button"
            onClick={() => setJointAngles(buildZeroAngles())}
            className="rounded-lg bg-slate-700 px-2 py-1 text-xs text-slate-300 transition hover:bg-slate-600"
          >
            초기화
          </button>
        </div>

        <section>
          <div className="mb-2 text-xs font-medium uppercase tracking-widest text-sky-500">왼팔</div>
          <div className="flex flex-col gap-3">
            {LEFT_JOINTS.map((def) => (
              <JointSlider key={def.name} def={def} value={jointAngles[def.name] ?? 0} onChange={setJoint} />
            ))}
          </div>
        </section>

        <section>
          <div className="mb-2 text-xs font-medium uppercase tracking-widest text-orange-400">오른팔</div>
          <div className="flex flex-col gap-3">
            {RIGHT_JOINTS.map((def) => (
              <JointSlider key={def.name} def={def} value={jointAngles[def.name] ?? 0} onChange={setJoint} />
            ))}
          </div>
        </section>
      </aside>

      {/* 3D canvas */}
      <div className="relative flex-1 bg-slate-950">
        <Canvas camera={{ position: [2.5, 1.8, 2.5], fov: 45 }} shadows>
          <ambientLight intensity={0.5} />
          <directionalLight position={[3, 4, 2]} intensity={1.2} castShadow />
          <directionalLight position={[-2, 2, -2]} intensity={0.4} />
          <URDFViewer
            url={URDF_URL}
            jointAngles={jointAngles}
          />
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

        <div className="absolute bottom-3 right-4 text-xs text-slate-600">
          dual_rb3_730e_ver3 · FK 뷰어
        </div>
      </div>
    </div>
  )
}
