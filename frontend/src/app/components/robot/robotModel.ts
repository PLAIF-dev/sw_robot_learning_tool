export type JointDef = {
  name: string
  label: string
  min: number
  max: number
}

export const URDF_URL = '/robots/dual_rb3_730e_ver3.urdf'

export const LEFT_JOINTS: JointDef[] = [
  { name: 'dual_rb3_730e_ver3_left_base_joint', label: 'Base', min: -6.2832, max: 6.2832 },
  { name: 'dual_rb3_730e_ver3_left_shoulder_joint', label: 'Shoulder', min: -6.2832, max: 6.2832 },
  { name: 'dual_rb3_730e_ver3_left_elbow_joint', label: 'Elbow', min: -2.618, max: 2.618 },
  { name: 'dual_rb3_730e_ver3_left_wrist1_joint', label: 'Wrist 1', min: -6.2832, max: 6.2832 },
  { name: 'dual_rb3_730e_ver3_left_wrist2_joint', label: 'Wrist 2', min: -6.2832, max: 6.2832 },
  { name: 'dual_rb3_730e_ver3_left_wrist3_joint', label: 'Wrist 3', min: -6.2832, max: 6.2832 },
]

export const RIGHT_JOINTS: JointDef[] = [
  { name: 'dual_rb3_730e_ver3_right_base_joint', label: 'Base', min: -6.2832, max: 6.2832 },
  { name: 'dual_rb3_730e_ver3_right_shoulder_joint', label: 'Shoulder', min: -6.2832, max: 6.2832 },
  { name: 'dual_rb3_730e_ver3_right_elbow_joint', label: 'Elbow', min: -2.618, max: 2.618 },
  { name: 'dual_rb3_730e_ver3_right_wrist1_joint', label: 'Wrist 1', min: -6.2832, max: 6.2832 },
  { name: 'dual_rb3_730e_ver3_right_wrist2_joint', label: 'Wrist 2', min: -6.2832, max: 6.2832 },
  { name: 'dual_rb3_730e_ver3_right_wrist3_joint', label: 'Wrist 3', min: -6.2832, max: 6.2832 },
]

const ALL_JOINTS = [...LEFT_JOINTS, ...RIGHT_JOINTS]

export function buildZeroAngles() {
  return Object.fromEntries(ALL_JOINTS.map((joint) => [joint.name, 0]))
}

export function buildJointAngles(leftJoints: number[], rightJoints: number[]) {
  return {
    ...Object.fromEntries(LEFT_JOINTS.map((joint, index) => [joint.name, leftJoints[index] ?? 0])),
    ...Object.fromEntries(RIGHT_JOINTS.map((joint, index) => [joint.name, rightJoints[index] ?? 0])),
  }
}
