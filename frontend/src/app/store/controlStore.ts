import { create } from 'zustand'
import { controlApi } from '../api/control'
import { recordsApi } from '../api/records'
import type { ControlMode, CoordFrame, TcpPose, TcpTarget } from '../types'

interface ControlState {
  target: TcpTarget
  mode: ControlMode
  coordinateFrame: CoordFrame
  stepSize: number
  leftTcpPose: TcpPose | null
  rightTcpPose: TcpPose | null
  leftJoints: number[]
  rightJoints: number[]
  ikSuccess: boolean | null
  recordingId: string | null
  setTarget: (target: TcpTarget) => Promise<void>
  setMode: (mode: ControlMode) => void
  setCoordinateFrame: (frame: CoordFrame) => void
  setStepSize: (value: number) => void
  refresh: () => Promise<void>
  move: (target: TcpTarget, dx: number, dy: number, dz: number, asMode?: ControlMode, coordinateFrameOverride?: CoordFrame) => Promise<void>
  jogJoint: (target: TcpTarget, jointIndex: number, delta: number) => Promise<void>
  reset: () => Promise<void>
  startRecording: (taskId: string) => Promise<void>
  stopRecording: () => Promise<void>
}

export const useControlStore = create<ControlState>((set, get) => ({
  target: 'both',
  mode: 'move',
  coordinateFrame: 'world',
  stepSize: 0.01,
  leftTcpPose: null,
  rightTcpPose: null,
  leftJoints: [],
  rightJoints: [],
  ikSuccess: null,
  recordingId: null,

  async setTarget(target) {
    set({ target })
    try {
      await controlApi.selectTarget(target)
    } catch {
      // mock fallback
    }
  },

  setMode(mode) {
    set({ mode })
  },

  setCoordinateFrame(coordinateFrame) {
    set({ coordinateFrame })
  },

  setStepSize(stepSize) {
    set({ stepSize })
  },

  async refresh() {
    try {
      const state = await controlApi.getTcpState()
      set({
        leftTcpPose: state.leftTcp,
        rightTcpPose: state.rightTcp,
        leftJoints: state.leftJoints,
        rightJoints: state.rightJoints,
        ikSuccess: state.ikSuccess,
      })
    } catch (error) {
      console.error('[controlStore] refresh failed', error)
      set({ ikSuccess: false })
    }
  },

  async move(target, dx, dy, dz, asMode, coordinateFrameOverride) {
    try {
      const coordinateFrame = coordinateFrameOverride ?? get().coordinateFrame
      const mode = asMode ?? get().mode
      const response = mode === 'move'
        ? await controlApi.move(target, coordinateFrame, dx, dy, dz)
        : await controlApi.rotate(target, coordinateFrame, dx, dy, dz)

      set({ ikSuccess: response.ikSuccess, target })
      await get().refresh()
    } catch (error) {
      console.error('[controlStore] move failed', error)
      set({ ikSuccess: false })
    }
  },

  async jogJoint(target, jointIndex, delta) {
    try {
      const response = await controlApi.jogJoint(target, jointIndex, delta)
      set((state) => ({
        ikSuccess: response.ikSuccess,
        target,
        leftJoints: target === 'left' && response.solvedJointState ? response.solvedJointState : state.leftJoints,
        rightJoints: target === 'right' && response.solvedJointState ? response.solvedJointState : state.rightJoints,
        leftTcpPose: target === 'left' && response.targetTcpPose ? response.targetTcpPose : state.leftTcpPose,
        rightTcpPose: target === 'right' && response.targetTcpPose ? response.targetTcpPose : state.rightTcpPose,
      }))
      void get().refresh()
    } catch (error) {
      console.error('[controlStore] jogJoint failed', error)
      set({ ikSuccess: false })
    }
  },

  async reset() {
    try {
      await controlApi.reset(get().target)
      await get().refresh()
    } catch (error) {
      console.error('[controlStore] reset failed', error)
      set({ ikSuccess: false })
    }
  },

  async startRecording(taskId) {
    const record = await recordsApi.startRecording(taskId, 'manual_test', get().target)
    set({ recordingId: record.id })
  },

  async stopRecording() {
    const recordingId = get().recordingId
    if (recordingId) {
      await recordsApi.stopRecording(recordingId)
    }
    set({ recordingId: null })
  },
}))
