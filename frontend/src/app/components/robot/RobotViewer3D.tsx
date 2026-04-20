import { Canvas } from '@react-three/fiber'
import { Grid, OrbitControls } from '@react-three/drei'
import type { TcpTarget } from '../../types'

function Arm({
  side,
  joints,
  active,
}: {
  side: 'left' | 'right'
  joints: number[]
  active: boolean
}) {
  const xOffset = side === 'left' ? 0.33 : -0.33
  const color = side === 'left' ? '#38bdf8' : '#fb923c'
  const muted = side === 'left' ? '#0f4c68' : '#7c2d12'
  const material = active ? color : muted

  return (
    <group position={[xOffset, 0, 0]}>
      <mesh position={[0, 0.18, 0]} rotation={[joints[0] ?? 0, 0, joints[1] ?? 0]}>
        <boxGeometry args={[0.08, 0.32, 0.08]} />
        <meshStandardMaterial color={material} />
      </mesh>
      <mesh position={[0, 0.48, 0]} rotation={[joints[2] ?? 0, 0, 0]}>
        <boxGeometry args={[0.06, 0.28, 0.06]} />
        <meshStandardMaterial color={material} />
      </mesh>
      <mesh position={[0, 0.66, 0]}>
        <sphereGeometry args={[0.045, 20, 20]} />
        <meshStandardMaterial color={active ? '#f8fafc' : '#475569'} emissive={active ? color : '#0f172a'} emissiveIntensity={0.4} />
      </mesh>
    </group>
  )
}

export function RobotViewer3D({
  leftJoints,
  rightJoints,
  selectedTarget,
}: {
  leftJoints: number[]
  rightJoints: number[]
  selectedTarget: TcpTarget
}) {
  return (
    <div className="panel-muted h-[280px] overflow-hidden">
      <Canvas camera={{ position: [1.6, 1.15, 1.4], fov: 48 }}>
        <ambientLight intensity={0.55} />
        <directionalLight position={[3, 3, 2]} intensity={1.3} />
        <mesh position={[0, -0.12, 0]}>
          <boxGeometry args={[0.8, 0.22, 0.56]} />
          <meshStandardMaterial color="#334155" />
        </mesh>
        <mesh position={[0, 0.2, 0]}>
          <boxGeometry args={[0.66, 0.28, 0.34]} />
          <meshStandardMaterial color="#475569" />
        </mesh>
        <Arm side="left" joints={leftJoints} active={selectedTarget === 'left' || selectedTarget === 'both'} />
        <Arm side="right" joints={rightJoints} active={selectedTarget === 'right' || selectedTarget === 'both'} />
        <Grid args={[4, 4]} position={[0, -0.24, 0]} infiniteGrid cellColor="#1e293b" sectionColor="#334155" fadeDistance={12} />
        <OrbitControls makeDefault enablePan target={[0, 0.2, 0]} />
      </Canvas>
    </div>
  )
}
