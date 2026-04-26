import { CameraView } from './CameraView'
import { useDeviceStore } from '../../store/deviceStore'
import type { CameraChannel, RoiRectangle } from '../../types'

export function CameraPanel({
  layout,
  singleChannel = 'head',
  roiMap,
  compact = false,
}: {
  layout: 'single' | 'triple'
  singleChannel?: CameraChannel
  roiMap?: Partial<Record<CameraChannel, RoiRectangle>>
  compact?: boolean
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

  const channels: CameraChannel[] = ['left', 'right', 'head']

  return (
    <div className="grid gap-3 lg:grid-cols-3">
      {channels.map((ch) => (
        <div key={ch} className={compact ? 'max-h-44 overflow-hidden' : ''}>
          <CameraView
            channel={ch}
            connected={connected[ch]}
            frameWidth={dimensions[ch].width}
            frameHeight={dimensions[ch].height}
            roi={roiMap?.[ch]}
          />
        </div>
      ))}
    </div>
  )
}
