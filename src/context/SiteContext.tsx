import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type Context,
  type ReactNode,
} from 'react'
import {
  siteInfo,
  recentSnapshots as mockRecentSnapshots,
  mockToolboxSessions,
} from '@/data/mock'
import type {
  SnapshotRecord,
  ToolboxSessionRecord,
  ToolboxWorkerEntry,
  WorkType,
  WorkerReport,
} from '@/types'

const TOOLBOX_KEY = 'gearsight.toolbox'
const SESSIONS_KEY = 'gearsight.toolboxSessions.v2'
const REPORTS_KEY = 'gearsight.workerReports'

export type RecentSnapshotItem = {
  id: string
  snapshotId: string
  previewUrl: string
  date: string
  time: string
  violationCount: number
}

interface CreateToolboxInput {
  dateOfApplication: string
  timeOfApplication: string
  permitReceiver: string
  contractorCompanyName: string
  siteAddressName: string
  workers: ToolboxWorkerEntry[]
  workType: WorkType
  requiredPpe: string[]
}

interface ReportDetectionInput {
  snapshotId: string
  personLabel: string
  personDetectionId: string
  reason?: string
}

interface SiteContextValue {
  projectId: string
  projectName: string
  /** Fresh projects start with no captured snapshots on the active session */
  isNewProject: boolean
  /** Snapshots for the active toolbox session (Live Feed rail) */
  recentSnapshots: RecentSnapshotItem[]
  toolbox: ToolboxSessionRecord | null
  hasToolbox: boolean
  /** All toolbox sessions (active first, then history) for Records */
  toolboxSessions: ToolboxSessionRecord[]
  reports: WorkerReport[]
  createToolbox: (input: CreateToolboxInput) => ToolboxSessionRecord
  clearToolbox: () => void
  getToolboxSession: (id: string) => ToolboxSessionRecord | null
  reportDetection: (input: ReportDetectionInput) => WorkerReport
}

/** Preserve context identity across Vite HMR so hooks don't crash to a white screen */
const SITE_CONTEXT_KEY = '__gearsightSiteContext'
const globalStore = globalThis as unknown as Record<
  string,
  Context<SiteContextValue | null> | undefined
>
const SiteContext =
  globalStore[SITE_CONTEXT_KEY] ?? createContext<SiteContextValue | null>(null)
globalStore[SITE_CONTEXT_KEY] = SiteContext

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
  try {
    sessionStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Ignore quota / private-mode failures — in-memory state still works
  }
}

function isValidSession(value: unknown): value is ToolboxSessionRecord {
  if (!value || typeof value !== 'object') return false
  const t = value as Partial<ToolboxSessionRecord>
  return Boolean(
    t.dateOfApplication &&
      t.timeOfApplication &&
      t.permitReceiver &&
      t.contractorCompanyName &&
      t.siteAddressName &&
      Array.isArray(t.workers) &&
      (t.workType === 'ground' || t.workType === 'arboreal') &&
      Array.isArray(t.requiredPpe) &&
      Array.isArray(t.snapshots) &&
      ('endedAt' in t),
  )
}

function demoSnapshotsForSession(sessionId: string): SnapshotRecord[] {
  return mockRecentSnapshots.slice(0, 8).map((row) => ({
    id: `${sessionId}-${row.id}`,
    snapshotId: row.snapshotId,
    previewUrl: row.previewUrl,
    date: row.date,
    time: row.time,
    violationCount: row.violationCount,
    status: row.violationCount > 0 ? 'non_compliant' : 'compliant',
  }))
}

function loadSessions(): ToolboxSessionRecord[] {
  const stored = readJson<unknown>(SESSIONS_KEY)
  if (Array.isArray(stored) && stored.length > 0) {
    const valid = stored.filter(isValidSession)
    if (valid.length > 0) return valid
  }
  return mockToolboxSessions
}

export function SiteProvider({ children }: { children: ReactNode }) {
  const [toolboxSessions, setToolboxSessions] = useState<ToolboxSessionRecord[]>(
    loadSessions,
  )
  const [toolbox, setToolbox] = useState<ToolboxSessionRecord | null>(() => {
    const stored = readJson<unknown>(TOOLBOX_KEY)
    if (isValidSession(stored) && stored.endedAt == null) return stored
    if (stored) sessionStorage.removeItem(TOOLBOX_KEY)
    return loadSessions().find((s) => s.endedAt == null) ?? null
  })
  const [reports, setReports] = useState<WorkerReport[]>(
    () => readJson<WorkerReport[]>(REPORTS_KEY) ?? [],
  )

  const recentSnapshots = useMemo<RecentSnapshotItem[]>(
    () =>
      (toolbox?.snapshots ?? []).map((s) => ({
        id: s.id,
        snapshotId: s.snapshotId,
        previewUrl: s.previewUrl,
        date: s.date,
        time: s.time,
        violationCount: s.violationCount,
      })),
    [toolbox],
  )
  const isNewProject = !toolbox || toolbox.snapshots.length === 0

  const createToolbox = useCallback((input: CreateToolboxInput) => {
    const id = `tb-${Date.now()}`
    const next: ToolboxSessionRecord = {
      id,
      dateOfApplication: input.dateOfApplication.trim(),
      timeOfApplication: input.timeOfApplication.trim(),
      permitReceiver: input.permitReceiver.trim(),
      contractorCompanyName: input.contractorCompanyName.trim(),
      siteAddressName: input.siteAddressName.trim(),
      workers: input.workers
        .map((w) => ({
          id: w.id,
          name: w.name.trim(),
          position: w.position.trim(),
        }))
        .filter((w) => w.name && w.position),
      workType: input.workType,
      requiredPpe: input.requiredPpe,
      createdAt: new Date().toISOString(),
      endedAt: null,
      // Demo: attach sample snapshots so Live Feed / session detail have content
      snapshots: demoSnapshotsForSession(id),
    }
    setToolbox(next)
    writeJson(TOOLBOX_KEY, next)
    setToolboxSessions((prev) => {
      const updated = [next, ...prev.filter((s) => s.id !== next.id)]
      writeJson(SESSIONS_KEY, updated)
      return updated
    })
    return next
  }, [])

  const clearToolbox = useCallback(() => {
    setToolbox((current) => {
      if (current) {
        const closed: ToolboxSessionRecord = {
          ...current,
          endedAt: new Date().toISOString(),
        }
        setToolboxSessions((prev) => {
          const updated = prev.map((s) => (s.id === closed.id ? closed : s))
          writeJson(SESSIONS_KEY, updated)
          return updated
        })
      }
      sessionStorage.removeItem(TOOLBOX_KEY)
      return null
    })
  }, [])

  const getToolboxSession = useCallback(
    (id: string) => toolboxSessions.find((s) => s.id === id) ?? null,
    [toolboxSessions],
  )

  const reportDetection = useCallback((input: ReportDetectionInput) => {
    const next: WorkerReport = {
      id: `rep-${Date.now()}`,
      workerId: input.personDetectionId,
      workerName: input.personLabel,
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
  }, [])

  const value = useMemo<SiteContextValue>(
    () => ({
      projectId: siteInfo.projectId,
      projectName: siteInfo.name,
      isNewProject,
      recentSnapshots,
      toolbox,
      hasToolbox: Boolean(toolbox),
      toolboxSessions,
      reports,
      createToolbox,
      clearToolbox,
      getToolboxSession,
      reportDetection,
    }),
    [
      isNewProject,
      recentSnapshots,
      toolbox,
      toolboxSessions,
      reports,
      createToolbox,
      clearToolbox,
      getToolboxSession,
      reportDetection,
    ],
  )

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>
}

export function useSite() {
  const ctx = useContext(SiteContext)
  if (!ctx) throw new Error('useSite must be used within SiteProvider')
  return ctx
}

/** Shared stats helpers for Records + session detail */
export function getSessionStats(session: ToolboxSessionRecord) {
  const snapshotCount = session.snapshots.length
  const totalViolations = session.snapshots.reduce(
    (sum, s) => sum + s.violationCount,
    0,
  )
  const compliantCount = session.snapshots.filter(
    (s) => s.status === 'compliant' || s.violationCount === 0,
  ).length
  const complianceRate =
    snapshotCount === 0
      ? 100
      : Math.round((compliantCount / snapshotCount) * 100)
  return { snapshotCount, totalViolations, complianceRate, compliantCount }
}
