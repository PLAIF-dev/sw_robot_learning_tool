import { useEffect } from 'react'
import { RobotViewer3D } from '../components/robot/RobotViewer3D'
import { useKeyboardTcp } from '../hooks/useKeyboardTcp'
import { useControlStore } from '../store/controlStore'

export function RobotViewerPage() {
  const leftJoints = useControlStore((state) => state.leftJoints)
  const rightJoints = useControlStore((state) => state.rightJoints)
  const leftTcpPose = useControlStore((state) => state.leftTcpPose)
  const rightTcpPose = useControlStore((state) => state.rightTcpPose)
  const selectedTarget = useControlStore((state) => state.target)
  const refresh = useControlStore((state) => state.refresh)

  useKeyboardTcp(true)

  useEffect(() => {
    void refresh()
  }, [refresh])

  return (
    <section className="panel p-6">
      <div className="section-title">3D Robot Viewer</div>
      <div className="mt-4">
        <RobotViewer3D
          leftJoints={leftJoints}
          rightJoints={rightJoints}
          leftTcpPose={leftTcpPose}
          rightTcpPose={rightTcpPose}
          selectedTarget={selectedTarget}
        />
      </div>
    </section>
  )
}
