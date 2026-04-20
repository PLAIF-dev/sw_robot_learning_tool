import { CameraView } from './CameraView'
import { useDeviceStore } from '../../store/deviceStore'
import type { CameraChannel } from '../../types'

export function CameraPanel({
  layout,
  singleChannel = 'head',
}: {
  layout: 'single' | 'triple'
  singleChannel?: CameraChannel
}) {
  const status = useDeviceStore((state) => state.status)

  const connected = {
    left: status?.leftCamera.connected ?? false,
    right: status?.rightCamera.connected ?? false,
    head: status?.headCamera.connected ?? false,
  }

  if (layout === 'single') {
    return <CameraView channel={singleChannel} connected={connected[singleChannel]} />
  }

  return (
    <div className="grid gap-3 lg:grid-cols-3">
      <CameraView channel="left" connected={connected.left} />
      <CameraView channel="head" connected={connected.head} />
      <CameraView channel="right" connected={connected.right} />
    </div>
  )
}
