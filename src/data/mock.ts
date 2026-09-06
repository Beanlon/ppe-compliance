import type {
  AnalysisItem,
  SnapshotRecord,
  ToolboxSession,
  User,
  Violation,
  WorkSession,
  Worker,
} from '@/types'

export const currentUser: User = {
  id: 'u-1',
  name: 'Admin',
  email: 'account@gmail.com',
  role: 'safety_officer',
}

export const siteInfo = {
  name: 'A.M. Mata Compound',
  address: 'A.M. Mata Compound, Maligaya Avenue, Matina, Davao City',
  mapImage:
    'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1200&q=80',
}

export const dashboardStats = {
  totalWorkers: 80,
  currentWorkers: 20,
  totalSnapshots: 20,
  snapshotsToday: 5,
  totalViolations: 20,
  violationsToday: 0,
}

export const workers: Worker[] = [
  {
    id: 'w-1',
    name: 'Juan Dela Cruz',
    employeeId: 'EMP-001',
    trade: 'Carpenter',
    phone: '0917-111-0001',
    status: 'active',
    violationCount: 2,
  },
  {
    id: 'w-2',
    name: 'Maria Santos',
    employeeId: 'EMP-002',
    trade: 'Electrician',
    phone: '0917-111-0002',
    status: 'active',
    violationCount: 0,
  },
  {
    id: 'w-3',
    name: 'Pedro Reyes',
    employeeId: 'EMP-003',
    trade: 'Welder',
    phone: '0917-111-0003',
    status: 'active',
    violationCount: 4,
  },
  {
    id: 'w-4',
    name: 'Ana Lim',
    employeeId: 'EMP-004',
    trade: 'Mason',
    phone: '0917-111-0004',
    status: 'active',
    violationCount: 1,
  },
  {
    id: 'w-5',
    name: 'Carlo Mendoza',
    employeeId: 'EMP-005',
    trade: 'Laborer',
    phone: '0917-111-0005',
    status: 'inactive',
    violationCount: 0,
  },
]

export const toolboxSessions: ToolboxSession[] = [
  {
    id: 'tb-1',
    title: 'Morning Safety Briefing — Zone A',
    date: '09/06/2026',
    time: '07:30 AM',
    location: siteInfo.address,
    requiredPpe: ['Hard Hat', 'Safety Vest', 'Gloves', 'Safety Boots'],
    attendeeIds: ['w-1', 'w-2', 'w-3', 'w-4'],
    status: 'completed',
  },
  {
    id: 'tb-2',
    title: 'Afternoon Toolbox — Roofing Crew',
    date: '09/06/2026',
    time: '01:00 PM',
    location: siteInfo.address,
    requiredPpe: ['Hard Hat', 'Safety Vest', 'Safety Boots'],
    attendeeIds: ['w-1', 'w-3', 'w-5'],
    status: 'active',
  },
]

export const workSessions: WorkSession[] = [
  {
    id: 'ws-1',
    toolboxId: 'tb-1',
    startedAt: '09/06/2026 08:00 AM',
    endedAt: '09/06/2026 12:00 PM',
    status: 'ended',
    snapshotCount: 12,
    violationCount: 8,
  },
  {
    id: 'ws-2',
    toolboxId: 'tb-2',
    startedAt: '09/06/2026 01:15 PM',
    endedAt: null,
    status: 'active',
    snapshotCount: 8,
    violationCount: 12,
  },
]

const previewPlaceholders = [
  'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=200&q=60',
  'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=200&q=60',
  'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=200&q=60',
]

export const snapshots: SnapshotRecord[] = Array.from({ length: 10 }, (_, i) => {
  const violationCount = [0, 12, 0, 12, 0, 12, 0, 12, 0, 12][i]
  return {
    id: `snap-${i + 1}`,
    snapshotId: `IDNO.-01251251${i}`,
    previewUrl: previewPlaceholders[i % previewPlaceholders.length],
    date: '01/12/2026',
    time: '09:00 PM',
    violationCount,
    status: violationCount === 0 ? 'clear' : 'flagged',
    accuracy: 92 - (i % 5),
    workSessionId: i < 5 ? 'ws-1' : 'ws-2',
  }
})

export const recentAnalyses: AnalysisItem[] = [
  {
    id: 'a-1',
    timestamp: 'September 06, 2026 | 09:00 AM',
    status: 'flagged',
    flaggedCount: 2,
  },
  {
    id: 'a-2',
    timestamp: 'September 06, 2026 | 09:00 AM',
    status: 'clear',
    flaggedCount: 0,
  },
  {
    id: 'a-3',
    timestamp: 'September 06, 2026 | 09:00 AM',
    status: 'flagged',
    flaggedCount: 2,
  },
  {
    id: 'a-4',
    timestamp: 'September 06, 2026 | 09:00 AM',
    status: 'clear',
    flaggedCount: 0,
  },
]

export const violations: Violation[] = [
  {
    id: 'v-1',
    workerId: 'w-1',
    snapshotId: 'snap-2',
    toolboxId: 'tb-1',
    missingPpe: ['Hard Hat', 'Gloves'],
    date: '09/06/2026',
    time: '09:15 AM',
    notes: 'Worker entered Zone A without hard hat.',
    reviewed: true,
  },
  {
    id: 'v-2',
    workerId: 'w-3',
    snapshotId: 'snap-4',
    toolboxId: 'tb-1',
    missingPpe: ['Safety Vest'],
    date: '09/06/2026',
    time: '10:02 AM',
    notes: 'Vest not visible in snapshot.',
    reviewed: false,
  },
  {
    id: 'v-3',
    workerId: 'w-4',
    snapshotId: 'snap-6',
    toolboxId: 'tb-2',
    missingPpe: ['Safety Boots', 'Gloves'],
    date: '09/06/2026',
    time: '02:20 PM',
    notes: 'Pending officer confirmation.',
    reviewed: false,
  },
]

export const ppeOptions = [
  'Hard Hat',
  'Safety Vest',
  'Gloves',
  'Safety Boots',
] as const
