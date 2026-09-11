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
