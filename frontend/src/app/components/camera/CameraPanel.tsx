import { CameraView } from './CameraView'
import { useDeviceStore } from '../../store/deviceStore'
import type { CameraChannel, RoiRectangle } from '../../types'

export function CameraPanel({
  layout,
  singleChannel = 'head',
  roiMap,
}: {
  layout: 'single' | 'triple'
  singleChannel?: CameraChannel
  roiMap?: Partial<Record<CameraChannel, RoiRectangle>>
}) {
  const status = useDeviceStore((state) => state.status)

  const connected = {
    left: status?.leftCamera.connected ?? false,
    right: status?.rightCamera.connected ?? false,
    head: status?.headCamera.connected ?? false,
  }

  const dimensions = {
    left: {
      width: status?.leftCamera.width ?? 640,
      height: status?.leftCamera.height ?? 480,
    },
    right: {
      width: status?.rightCamera.width ?? 640,
      height: status?.rightCamera.height ?? 480,
    },
    head: {
      width: status?.headCamera.width ?? 1280,
      height: status?.headCamera.height ?? 720,
    },
  }

  if (layout === 'single') {
    return (
      <CameraView
        channel={singleChannel}
        connected={connected[singleChannel]}
        frameWidth={dimensions[singleChannel].width}
        frameHeight={dimensions[singleChannel].height}
        roi={roiMap?.[singleChannel]}
      />
    )
  }

  return (
    <div className="grid gap-3 lg:grid-cols-3">
      <CameraView
        channel="left"
        connected={connected.left}
        frameWidth={dimensions.left.width}
        frameHeight={dimensions.left.height}
        roi={roiMap?.left}
      />
      <CameraView
        channel="right"
        connected={connected.right}
        frameWidth={dimensions.right.width}
        frameHeight={dimensions.right.height}
        roi={roiMap?.right}
      />
      <CameraView
        channel="head"
        connected={connected.head}
        frameWidth={dimensions.head.width}
        frameHeight={dimensions.head.height}
        roi={roiMap?.head}
      />
    </div>
  )
}
