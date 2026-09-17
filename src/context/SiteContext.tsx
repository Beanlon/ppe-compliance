import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { siteInfo, siteWorkers, recentSnapshots as mockRecentSnapshots } from '@/data/mock'
import type { ToolboxTalk, Worker, WorkerReport } from '@/types'

const TOOLBOX_KEY = 'gearsight.toolbox'
const REPORTS_KEY = 'gearsight.workerReports'
const WORKERS_KEY = 'gearsight.workers'

export type RecentSnapshotItem = {
  id: string
  snapshotId: string
  previewUrl: string
  date: string
  time: string
  violationCount: number
}

interface CreateToolboxInput {
  title: string
  topic: string
  conductedBy: string
  date: string
  time: string
  notes: string
  attendeeIds: string[]
  activePpe: string[]
}

interface AddWorkerInput {
  name: string
  role: string
  phone?: string
}

interface ReportWorkerInput {
  workerId: string
  snapshotId: string
  personLabel: string
  personDetectionId: string
  reason?: string
}

interface SiteContextValue {
  projectId: string
  projectName: string
  /** Fresh projects start with no captured snapshots */
  isNewProject: boolean
  recentSnapshots: RecentSnapshotItem[]
  workers: Worker[]
  toolbox: ToolboxTalk | null
  hasToolbox: boolean
  reports: WorkerReport[]
  createToolbox: (input: CreateToolboxInput) => ToolboxTalk
  clearToolbox: () => void
  addWorker: (input: AddWorkerInput) => Worker
  reportWorker: (input: ReportWorkerInput) => WorkerReport | null
}

const SiteContext = createContext<SiteContextValue | null>(null)

function readJson<T>(key: string): T | null {
  try {
    const raw = sessionStorage.getItem(key)
    if (!raw) return null
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

function writeJson(key: string, value: unknown) {
  sessionStorage.setItem(key, JSON.stringify(value))
}

export function SiteProvider({ children }: { children: ReactNode }) {
  const [toolbox, setToolbox] = useState<ToolboxTalk | null>(
    () => readJson<ToolboxTalk>(TOOLBOX_KEY),
  )
  const [reports, setReports] = useState<WorkerReport[]>(
    () => readJson<WorkerReport[]>(REPORTS_KEY) ?? [],
  )
  /** Seed from mock when no saved crew exists yet */
  const [workers, setWorkers] = useState<Worker[]>(() => {
    const stored = readJson<Worker[]>(WORKERS_KEY)
    if (Array.isArray(stored) && stored.length > 0) return stored
    return siteWorkers
  })
  /** Restored mock recent snapshots for demo */
  const [recentSnapshots] = useState<RecentSnapshotItem[]>(() =>
    mockRecentSnapshots.slice(0, -2),
  )
  const isNewProject = recentSnapshots.length === 0

  const createToolbox = useCallback((input: CreateToolboxInput) => {
    const next: ToolboxTalk = {
      id: `tb-${Date.now()}`,
      title: input.title.trim(),
      topic: input.topic.trim(),
      conductedBy: input.conductedBy.trim(),
      date: input.date,
      time: input.time,
      notes: input.notes.trim(),
      attendeeIds: input.attendeeIds,
      activePpe: input.activePpe,
      createdAt: new Date().toISOString(),
    }
    setToolbox(next)
    writeJson(TOOLBOX_KEY, next)
    return next
  }, [])

  const clearToolbox = useCallback(() => {
    setToolbox(null)
    sessionStorage.removeItem(TOOLBOX_KEY)
  }, [])

  const addWorker = useCallback((input: AddWorkerInput) => {
    const next: Worker = {
      id: `w-${Date.now()}`,
      name: input.name.trim(),
      role: input.role.trim(),
      phone: input.phone?.trim() || undefined,
      status: 'active',
    }
    setWorkers((prev) => {
      const updated = [next, ...prev]
      writeJson(WORKERS_KEY, updated)
      return updated
    })
    return next
  }, [])

  const reportWorker = useCallback(
    (input: ReportWorkerInput) => {
      const worker = workers.find((w) => w.id === input.workerId)
      if (!worker) return null

      const next: WorkerReport = {
        id: `rep-${Date.now()}`,
        workerId: worker.id,
        workerName: worker.name,
        snapshotId: input.snapshotId,
        personLabel: input.personLabel,
        personDetectionId: input.personDetectionId,
        reason: input.reason?.trim() || 'PPE non-compliance follow-up',
        createdAt: new Date().toISOString(),
      }
      setReports((prev) => {
        const updated = [next, ...prev]
        writeJson(REPORTS_KEY, updated)
        return updated
      })
      return next
    },
    [workers],
  )

  const value = useMemo<SiteContextValue>(
    () => ({
      projectId: siteInfo.projectId,
      projectName: siteInfo.name,
      isNewProject,
      recentSnapshots,
      workers,
      toolbox,
      hasToolbox: Boolean(toolbox),
      reports,
      createToolbox,
      clearToolbox,
      addWorker,
      reportWorker,
    }),
    [
      isNewProject,
      recentSnapshots,
      workers,
      toolbox,
      reports,
      createToolbox,
      clearToolbox,
      addWorker,
      reportWorker,
    ],
  )

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>
}

export function useSite() {
  const ctx = useContext(SiteContext)
  if (!ctx) throw new Error('useSite must be used within SiteProvider')
  return ctx
}
