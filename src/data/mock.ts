import type {
  BoundingBox,
  PersonDetection,
  SnapshotDetail,
  SnapshotRecord,
  User,
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
  projectId: 'PRJ-2026-AMT',
  address: 'A.M. Mata Compound Maligaya Avenue Matina Davao City',
  currentDate: 'December 02, 2026',
  currentTime: '09:00 AM',
  requiredPpe: ['Safety Vest', 'Safety Shoes', 'Harness', 'Helmet'],
  liveFeedUrl:
    'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1400&q=80',
  cameraLabel: 'Iriun Webcam',
}

/** Workers registered under the active project site */
export const siteWorkers: Worker[] = [
  {
    id: 'w-1',
    name: 'Juan Dela Cruz',
    role: 'Foreman',
    phone: '+63 917 555 0101',
    status: 'active',
  },
  {
    id: 'w-2',
    name: 'Maria Santos',
    role: 'Welder',
    phone: '+63 917 555 0102',
    status: 'active',
  },
  {
    id: 'w-3',
    name: 'Pedro Reyes',
    role: 'Mason',
    phone: '+63 917 555 0103',
    status: 'active',
  },
  {
    id: 'w-4',
    name: 'Ana Villanueva',
    role: 'Electrician',
    phone: '+63 917 555 0104',
    status: 'active',
  },
  {
    id: 'w-5',
    name: 'Carlos Mendoza',
    role: 'Laborer',
    phone: '+63 917 555 0105',
    status: 'active',
  },
  {
    id: 'w-6',
    name: 'Lisa Garcia',
    role: 'Safety Steward',
    phone: '+63 917 555 0106',
    status: 'active',
  },
  {
    id: 'w-7',
    name: 'Roberto Lim',
    role: 'Crane Operator',
    phone: '+63 917 555 0107',
    status: 'inactive',
  },
  {
    id: 'w-8',
    name: 'Sofia Ramirez',
    role: 'Carpenter',
    phone: '+63 917 555 0108',
    status: 'active',
  },
]

export const complianceBenchmark = {
  highCompliance: 85,
  modelAccuracy: 85,
  ppeDetection: 84,
  compliant: 20,
  nonCompliant: 12,
  needsChecking: 20,
}

const previewUrl =
  'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=900&q=70'

const snapshotPreviews = [
  'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=640&q=70',
  'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=640&q=70',
  'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=640&q=70',
  'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=640&q=70',
  'https://images.unsplash.com/photo-1590496793929-36417d95d294?auto=format&fit=crop&w=640&q=70',
  'https://images.unsplash.com/photo-1589939705385-9782769c294b?auto=format&fit=crop&w=640&q=70',
  'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=640&q=70',
  'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=640&q=70',
]

export const recentSnapshots = Array.from({ length: 12 }, (_, i) => ({
  id: `recent-${i + 1}`,
  snapshotId: `SSID-1213-${4152 + i}`,
  previewUrl: snapshotPreviews[i % snapshotPreviews.length],
  date: i % 2 === 0 ? 'December 12, 2026' : 'December 11, 2026',
  time: i % 3 === 0 ? '09:00 AM' : i % 3 === 1 ? '11:30 AM' : '02:15 PM',
  violationCount: i % 3 === 0 ? 12 : i % 5 === 0 ? 3 : 0,
}))

/** Shared records pool for list / grid views */
export const snapshots: SnapshotRecord[] = Array.from({ length: 48 }, (_, i) => {
  const ids = [
    'AWDS - 0131 - 2145',
    'SADA - 0131 - 2145',
    'SSID - 0102 - 2102',
    'SSID-1213-4152',
  ]
  return {
    id: `snap-${i + 1}`,
    snapshotId: ids[i % ids.length],
    previewUrl,
    date: i % 3 === 0 ? 'December 05, 2025' : 'December 12, 2026',
    time: i % 2 === 0 ? '09:00 PM' : '09:00 AM',
    violationCount: i % 4 === 0 ? 12 : 0,
    status: i % 4 === 0 ? 'non_compliant' : 'compliant',
  }
})

export const listSnapshots = snapshots
export const gridSnapshots = snapshots

const REQUIRED_PPE = ['Helmet', 'Safety Vest', 'Gloves', 'Safety Shoes', 'Harness']

/** Primary demo snapshot with nested person → PPE boxes */
const demoPeople: PersonDetection[] = [
  {
    id: 'person-1',
    label: 'Person 1',
    box: { x: 12, y: 10, w: 22, h: 78 },
    status: 'non_compliant',
    ppe: [
      {
        id: 'p1-helmet',
        label: 'Helmet',
        detected: true,
        confidence: 0.94,
        box: { x: 16, y: 11, w: 10, h: 10 },
      },
      {
        id: 'p1-vest',
        label: 'Safety Vest',
        detected: true,
        confidence: 0.91,
        box: { x: 15, y: 28, w: 16, h: 28 },
      },
      {
        id: 'p1-gloves',
        label: 'Gloves',
        detected: false,
        requiredCount: 2,
        detectedCount: 1,
        confidence: 0.72,
        box: { x: 14, y: 54, w: 6, h: 8 },
      },
      {
        id: 'p1-shoes',
        label: 'Safety Shoes',
        detected: true,
        confidence: 0.88,
        box: { x: 16, y: 78, w: 12, h: 8 },
      },
      {
        id: 'p1-harness',
        label: 'Harness',
        detected: false,
        requiredCount: 1,
        detectedCount: 0,
      },
    ],
  },
  {
    id: 'person-2',
    label: 'Person 2',
    box: { x: 38, y: 14, w: 20, h: 72 },
    status: 'compliant',
    ppe: [
      {
        id: 'p2-helmet',
        label: 'Helmet',
        detected: true,
        confidence: 0.96,
        box: { x: 42, y: 15, w: 9, h: 9 },
      },
      {
        id: 'p2-vest',
        label: 'Safety Vest',
        detected: true,
        confidence: 0.93,
        box: { x: 40, y: 30, w: 15, h: 26 },
      },
      {
        id: 'p2-gloves',
        label: 'Gloves',
        detected: true,
        requiredCount: 2,
        detectedCount: 2,
        confidence: 0.89,
        box: { x: 39, y: 52, w: 7, h: 7 },
      },
      {
        id: 'p2-shoes',
        label: 'Safety Shoes',
        detected: true,
        confidence: 0.9,
        box: { x: 42, y: 76, w: 11, h: 7 },
      },
      {
        id: 'p2-harness',
        label: 'Harness',
        detected: true,
        confidence: 0.85,
        box: { x: 42, y: 34, w: 12, h: 18 },
      },
    ],
  },
  {
    id: 'person-3',
    label: 'Person 3',
    box: { x: 62, y: 12, w: 21, h: 76 },
    status: 'non_compliant',
    ppe: [
      {
        id: 'p3-helmet',
        label: 'Helmet',
        detected: false,
        requiredCount: 1,
        detectedCount: 0,
      },
      {
        id: 'p3-vest',
        label: 'Safety Vest',
        detected: true,
        confidence: 0.92,
        box: { x: 65, y: 28, w: 15, h: 27 },
      },
      {
        id: 'p3-gloves',
        label: 'Gloves',
        detected: true,
        requiredCount: 2,
        detectedCount: 2,
        confidence: 0.87,
        box: { x: 64, y: 52, w: 7, h: 7 },
      },
      {
        id: 'p3-shoes',
        label: 'Safety Shoes',
        detected: true,
        confidence: 0.84,
        box: { x: 66, y: 78, w: 12, h: 7 },
      },
      {
        id: 'p3-harness',
        label: 'Harness',
        detected: false,
        requiredCount: 1,
        detectedCount: 0,
      },
    ],
  },
]

function countViolations(people: PersonDetection[]): number {
  return people.reduce(
    (sum, person) =>
      sum +
      person.ppe.filter((item) => {
        if (
          item.requiredCount != null &&
          item.detectedCount != null &&
          item.detectedCount < item.requiredCount
        ) {
          return true
        }
        return !item.detected
      }).length,
    0,
  )
}

function buildDetailFromRecord(
  record: SnapshotRecord,
  people: PersonDetection[],
): SnapshotDetail {
  const violations = countViolations(people)
  return {
    ...record,
    imageUrl: record.previewUrl,
    cameraLabel: siteInfo.cameraLabel,
    requiredPpe: REQUIRED_PPE,
    people,
    violationCount: violations,
    status:
      violations > 0
        ? 'non_compliant'
        : record.status === 'needs_checking'
          ? 'needs_checking'
          : 'compliant',
  }
}

/** Rich demo used when opening the first records / recent entries */
export const snapshotDetailsById: Record<string, SnapshotDetail> = {
  'snap-1': buildDetailFromRecord(snapshots[0], demoPeople),
  'recent-1': buildDetailFromRecord(
    {
      id: 'recent-1',
      snapshotId: recentSnapshots[0].snapshotId,
      previewUrl: recentSnapshots[0].previewUrl,
      date: recentSnapshots[0].date,
      time: recentSnapshots[0].time,
      violationCount: recentSnapshots[0].violationCount,
      status: 'non_compliant',
    },
    demoPeople,
  ),
}

function compliantPerson(
  id: string,
  label: string,
  box: BoundingBox,
): PersonDetection {
  return {
    id,
    label,
    box,
    status: 'compliant',
    ppe: [
      {
        id: `${id}-helmet`,
        label: 'Helmet',
        detected: true,
        confidence: 0.95,
        box: {
          x: box.x + box.w * 0.2,
          y: box.y + 1,
          w: box.w * 0.45,
          h: box.h * 0.12,
        },
      },
      {
        id: `${id}-vest`,
        label: 'Safety Vest',
        detected: true,
        confidence: 0.93,
        box: {
          x: box.x + box.w * 0.1,
          y: box.y + box.h * 0.22,
          w: box.w * 0.75,
          h: box.h * 0.35,
        },
      },
      {
        id: `${id}-gloves`,
        label: 'Gloves',
        detected: true,
        requiredCount: 2,
        detectedCount: 2,
        confidence: 0.9,
        box: {
          x: box.x + box.w * 0.05,
          y: box.y + box.h * 0.55,
          w: box.w * 0.3,
          h: box.h * 0.1,
        },
      },
      {
        id: `${id}-shoes`,
        label: 'Safety Shoes',
        detected: true,
        confidence: 0.88,
        box: {
          x: box.x + box.w * 0.2,
          y: box.y + box.h * 0.88,
          w: box.w * 0.55,
          h: box.h * 0.1,
        },
      },
      {
        id: `${id}-harness`,
        label: 'Harness',
        detected: true,
        confidence: 0.86,
        box: {
          x: box.x + box.w * 0.2,
          y: box.y + box.h * 0.28,
          w: box.w * 0.55,
          h: box.h * 0.22,
        },
      },
    ],
  }
}

function fallbackPeople(nonCompliant: boolean): PersonDetection[] {
  if (!nonCompliant) {
    return [
      compliantPerson('person-1', 'Person 1', { x: 18, y: 12, w: 24, h: 74 }),
      compliantPerson('person-2', 'Person 2', { x: 52, y: 14, w: 22, h: 72 }),
    ]
  }
  return demoPeople
}

/** Resolve a snapshot detail by route id (records or recent). */
export function getSnapshotDetail(id: string): SnapshotDetail | null {
  if (snapshotDetailsById[id]) return snapshotDetailsById[id]

  const fromRecords = snapshots.find((s) => s.id === id)
  if (fromRecords) {
    return buildDetailFromRecord(
      fromRecords,
      fallbackPeople(fromRecords.status === 'non_compliant'),
    )
  }

  const fromRecent = recentSnapshots.find((s) => s.id === id)
  if (fromRecent) {
    const status =
      fromRecent.violationCount > 0 ? 'non_compliant' : 'compliant'
    return buildDetailFromRecord(
      {
        id: fromRecent.id,
        snapshotId: fromRecent.snapshotId,
        previewUrl: fromRecent.previewUrl,
        date: fromRecent.date,
        time: fromRecent.time,
        violationCount: fromRecent.violationCount,
        status,
      },
      fallbackPeople(status === 'non_compliant'),
    )
  }

  return null
}

/** Human-readable missing / partial PPE message for a detection row */
export function describePpeGap(item: {
  label: string
  detected: boolean
  requiredCount?: number
  detectedCount?: number
}): string | null {
  const required = item.requiredCount ?? 1
  const found = item.detectedCount ?? (item.detected ? required : 0)
  const missing = Math.max(0, required - found)

  if (missing <= 0) return null

  const singular = item.label.replace(/s$/i, '')
  if (required > 1) {
    return `${missing} ${missing === 1 ? singular.toLowerCase() : item.label.toLowerCase()} not detected`
  }
  return `${item.label} not detected`
}
