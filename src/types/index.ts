export type UserRole = 'safety_officer' | 'site_engineer'

export type ComplianceStatus = 'compliant' | 'non_compliant' | 'needs_checking'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
}

export interface SnapshotRecord {
  id: string
  snapshotId: string
  previewUrl: string
  date: string
  time: string
  violationCount: number
  status: ComplianceStatus
}

/** Percent of image width/height (0–100) for CSS overlays */
export interface BoundingBox {
  x: number
  y: number
  w: number
  h: number
}

export interface PpeDetection {
  id: string
  /** Display name, e.g. "Helmet", "Gloves" */
  label: string
  detected: boolean
  confidence?: number
  /** e.g. gloves may require 2 */
  requiredCount?: number
  detectedCount?: number
  /** Nested box inside the person box when this PPE was found */
  box?: BoundingBox
}

export interface PersonDetection {
  id: string
  label: string
  box: BoundingBox
  status: ComplianceStatus
  ppe: PpeDetection[]
}

export interface SnapshotDetail extends SnapshotRecord {
  imageUrl: string
  cameraLabel: string
  requiredPpe: string[]
  people: PersonDetection[]
}

export interface Worker {
  id: string
  name: string
  role: string
  phone?: string
  status: 'active' | 'inactive'
}

export interface ToolboxTalk {
  id: string
  title: string
  topic: string
  conductedBy: string
  date: string
  time: string
  notes: string
  attendeeIds: string[]
  /** PPE required / active for today’s work */
  activePpe: string[]
  createdAt: string
}

export interface WorkerReport {
  id: string
  workerId: string
  workerName: string
  snapshotId: string
  personLabel: string
  personDetectionId: string
  reason: string
  createdAt: string
}
