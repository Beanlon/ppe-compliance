import type { SnapshotRecord, User } from '@/types'

export const currentUser: User = {
  id: 'u-1',
  name: 'Admin',
  email: 'account@gmail.com',
  role: 'safety_officer',
}

export const siteInfo = {
  name: 'A.M. Mata Compound',
  address: 'A.M. Mata Compound Maligaya Avenue Matina Davao City',
  currentDate: 'December 02, 2026',
  currentTime: '09:00 AM',
  requiredPpe: ['Safety Vest', 'Safety Shoes', 'Harness', 'Helmet'],
  liveFeedUrl:
    'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1400&q=80',
  cameraLabel: 'Iriun Webcam',
}

export const complianceBenchmark = {
  highCompliance: 90,
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
