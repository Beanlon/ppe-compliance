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

export type WorkType = 'ground' | 'arboreal'

/** Inline crew entry captured on the toolbox / permit form */
export interface ToolboxWorkerEntry {
  id: string
  name: string
  position: string
}

export interface ToolboxTalk {
  id: string
  /** MM-DD-YYYY */
  dateOfApplication: string
  /** HH:MM AM/PM */
  timeOfApplication: string
  /** Logged-in user; not editable on the form */
  permitReceiver: string
  contractorCompanyName: string
  siteAddressName: string
  workers: ToolboxWorkerEntry[]
  workType: WorkType
  /** PPE required for this work session */
  requiredPpe: string[]
  createdAt: string
}

/** Archived / listed toolbox session with its captured snapshots */
export interface ToolboxSessionRecord extends ToolboxTalk {
  /** null while the session is still active */
  endedAt: string | null
  snapshots: SnapshotRecord[]
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
