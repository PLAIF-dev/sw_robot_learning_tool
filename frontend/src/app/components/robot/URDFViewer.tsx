import { useEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import URDFLoader from 'urdf-loader'
import type { URDFRobot } from 'urdf-loader'

const TCP_AXIS_GROUP_NAME = '__tcp_axes__'
const TCP_AXIS_LENGTH = 0.12
const TCP_AXIS_HEAD_LENGTH = 0.03
const TCP_AXIS_HEAD_WIDTH = 0.018

// Custom binary STL parser — bypasses Three.js STLLoader which misreads COLOR= MATERIAL= headers
async function parseBinarySTL(path: string): Promise<THREE.BufferGeometry> {
  const buf = await fetch(path).then((r) => r.arrayBuffer())
  const view = new DataView(buf)
  const numFaces = view.getUint32(80, true)
  const positions = new Float32Array(numFaces * 9)
  const normals = new Float32Array(numFaces * 9)
  let off = 84
  for (let i = 0; i < numFaces; i++) {
    const nx = view.getFloat32(off, true); const ny = view.getFloat32(off + 4, true); const nz = view.getFloat32(off + 8, true)
    off += 12
    for (let v = 0; v < 3; v++) {
      const vi = i * 9 + v * 3
      positions[vi] = view.getFloat32(off, true); positions[vi + 1] = view.getFloat32(off + 4, true); positions[vi + 2] = view.getFloat32(off + 8, true)
      normals[vi] = nx; normals[vi + 1] = ny; normals[vi + 2] = nz
      off += 12
    }
    off += 2 // attribute byte count
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geo.setAttribute('normal', new THREE.BufferAttribute(normals, 3))
  return geo
}

const ROBOT_MATERIAL = new THREE.MeshStandardMaterial({
  color: '#94a3b8',
  roughness: 0.6,
  metalness: 0.3,
})

function applyDefaultMaterial(obj: THREE.Object3D) {
  obj.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh
      if (!mesh.material || (mesh.material as THREE.Material).type === 'MeshBasicMaterial') {
        mesh.material = ROBOT_MATERIAL
      }
    }
  })
}

function createTcpAxes() {
  const group = new THREE.Group()
  group.name = TCP_AXIS_GROUP_NAME
  group.add(new THREE.ArrowHelper(
    new THREE.Vector3(1, 0, 0),
    new THREE.Vector3(0, 0, 0),
    TCP_AXIS_LENGTH,
    '#ef4444',
    TCP_AXIS_HEAD_LENGTH,
    TCP_AXIS_HEAD_WIDTH,
  ))
  group.add(new THREE.ArrowHelper(
    new THREE.Vector3(0, 1, 0),
    new THREE.Vector3(0, 0, 0),
    TCP_AXIS_LENGTH,
    '#22c55e',
    TCP_AXIS_HEAD_LENGTH,
    TCP_AXIS_HEAD_WIDTH,
  ))
  group.add(new THREE.ArrowHelper(
    new THREE.Vector3(0, 0, 1),
    new THREE.Vector3(0, 0, 0),
    TCP_AXIS_LENGTH,
    '#3b82f6',
    TCP_AXIS_HEAD_LENGTH,
    TCP_AXIS_HEAD_WIDTH,
  ))
  return group
}

function attachTcpAxes(robot: URDFRobot) {
  const tcpFrames = [
    'dual_rb3_730e_ver3_left_tcp_link',
    'dual_rb3_730e_ver3_right_tcp_link',
  ]

  for (const frameName of tcpFrames) {
    const frame = robot.frames?.[frameName]
    if (!frame || frame.getObjectByName(TCP_AXIS_GROUP_NAME)) {
      continue
    }

    frame.add(createTcpAxes())
  }
}

export function URDFViewer({
  url,
  jointAngles,
  onLoaded,
}: {
  url: string
  jointAngles: Record<string, number>
  onLoaded?: () => void
}) {
  const { scene } = useThree()
  const robotRef = useRef<URDFRobot | null>(null)
  const onLoadedRef = useRef(onLoaded)
  useEffect(() => { onLoadedRef.current = onLoaded })

  useEffect(() => {
    let cancelled = false
    const loader = new URDFLoader()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    loader.loadMeshCb = (path: string, manager: THREE.LoadingManager, done: (obj: THREE.Object3D, err?: Error) => void) => {
      if (path.endsWith('.obj')) {
        new OBJLoader(manager).load(
          path,
          (obj) => { applyDefaultMaterial(obj); done(obj) },
          undefined,
          (err) => done(new THREE.Object3D(), err as Error),
        )
      } else if (path.endsWith('.stl') || path.endsWith('.STL')) {
        parseBinarySTL(path).then((geo) => {
          done(new THREE.Mesh(geo, ROBOT_MATERIAL.clone()))
        }).catch((err) => done(new THREE.Object3D(), err as Error))
      } else {
        done(new THREE.Object3D())
      }
    }

    loader.load(
      url,
      (robot: URDFRobot) => {
        if (cancelled) return
        // URDF uses Z-up; rotate to Three.js Y-up
        robot.rotation.x = -Math.PI / 2
        attachTcpAxes(robot)
        robotRef.current = robot
        scene.add(robot)
        onLoadedRef.current?.()
      },
      undefined,
      (err) => console.error('[URDFViewer] load error', err),
    )

    return () => {
      cancelled = true
      if (robotRef.current) {
        scene.remove(robotRef.current)
        robotRef.current = null
      }
    }
  // url changes mean reload — intentional
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url])

  useEffect(() => {
    const robot = robotRef.current
    if (!robot) return
    for (const [name, angle] of Object.entries(jointAngles)) {
      const joint = robot.joints?.[name]
      if (joint) {
        joint.setJointValue(angle)
      }
    }
  }, [jointAngles])

  return null
}
