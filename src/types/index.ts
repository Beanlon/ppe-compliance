export type UserRole = 'safety_officer' | 'site_engineer'

export type PpeItem = 'Hard Hat' | 'Safety Vest' | 'Gloves' | 'Safety Boots'

export type ComplianceStatus = 'compliant' | 'non_compliant' | 'uncertain' | 'clear' | 'flagged'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
}

export interface Worker {
  id: string
  name: string
  employeeId: string
  trade: string
  phone: string
  status: 'active' | 'inactive'
  violationCount: number
}

export interface ToolboxSession {
  id: string
  title: string
  date: string
  time: string
  location: string
  requiredPpe: PpeItem[]
  attendeeIds: string[]
  status: 'scheduled' | 'active' | 'completed'
}

export interface SnapshotRecord {
  id: string
  snapshotId: string
  previewUrl: string
  date: string
  time: string
  violationCount: number
  status: ComplianceStatus
  accuracy: number
  workSessionId: string
}

export interface AnalysisItem {
  id: string
  timestamp: string
  status: 'flagged' | 'clear'
  flaggedCount: number
}

export interface Violation {
  id: string
  workerId: string
  snapshotId: string
  toolboxId: string
  missingPpe: PpeItem[]
  date: string
  time: string
  notes: string
  reviewed: boolean
}

export interface WorkSession {
  id: string
  toolboxId: string
  startedAt: string
  endedAt: string | null
  status: 'active' | 'ended'
  snapshotCount: number
  violationCount: number
}
