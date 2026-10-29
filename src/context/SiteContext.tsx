import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type Context,
  type ReactNode,
} from 'react'
import { useAuth } from '@/context/AuthContext'
import { siteInfo } from '@/data/mock'
import { isSupabaseConfigured } from '@/lib/supabaseClient'
import {
  captureLiveSnapshot,
  createToolboxSession,
  createWorkerReport,
  endToolboxSession,
  fetchOwnedProjects,
  fetchReportsForUser,
  fetchSessionsForProject,
  updateSessionCamera,
} from '@/lib/supabaseApi'
import type { ProjectRow } from '@/types/database'
import type {
  CameraSource,
  PersonDetection,
  SnapshotDetail,
  SnapshotRecord,
  ToolboxSessionRecord,
  ToolboxWorkerEntry,
  WorkType,
  WorkerReport,
} from '@/types'

const LAST_CAMERA_KEY = 'gearsight.lastCamera'
const ACTIVE_PROJECT_KEY = 'gearsight.activeProjectId'

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
  camera: CameraSource | null
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
  /** Camera used most recently on this machine; pre-selects the toolbox form */
  lastCamera: CameraSource | null
  loading: boolean
  createToolbox: (input: CreateToolboxInput) => Promise<ToolboxSessionRecord>
  /** Switch the camera for the active toolbox session */
  setToolboxCamera: (camera: CameraSource) => Promise<void>
  clearToolbox: () => Promise<void>
  getToolboxSession: (id: string) => ToolboxSessionRecord | null
  reportDetection: (input: ReportDetectionInput) => Promise<WorkerReport>
  /**
   * TEMP test helper: save the current live frame + detections to Supabase.
   * Remove when automatic capture replaces the sample button.
   */
  captureSnapshot: (input: {
    image: Blob
    people: PersonDetection[]
  }) => Promise<SnapshotDetail>
}

const SITE_CONTEXT_KEY = '__gearsightSiteContext'
const globalStore = globalThis as unknown as Record<
  string,
  Context<SiteContextValue | null> | undefined
>
const SiteContext =
  globalStore[SITE_CONTEXT_KEY] ?? createContext<SiteContextValue | null>(null)
globalStore[SITE_CONTEXT_KEY] = SiteContext

function readLastCamera(): CameraSource | null {
  try {
    const raw = localStorage.getItem(LAST_CAMERA_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<CameraSource>
    return parsed.deviceId && parsed.label
      ? { deviceId: parsed.deviceId, label: parsed.label }
      : null
  } catch {
    return null
  }
}

function writeLastCamera(camera: CameraSource) {
  try {
    localStorage.setItem(LAST_CAMERA_KEY, JSON.stringify(camera))
  } catch {
    // Ignore quota / private-mode failures
  }
}

export function SiteProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth()
  const [project, setProject] = useState<ProjectRow | null>(null)
  const [toolboxSessions, setToolboxSessions] = useState<ToolboxSessionRecord[]>(
    [],
  )
  const [toolbox, setToolbox] = useState<ToolboxSessionRecord | null>(null)
  const [reports, setReports] = useState<WorkerReport[]>([])
  const [lastCamera, setLastCamera] = useState<CameraSource | null>(
    readLastCamera,
  )
  const [loading, setLoading] = useState(false)

  const rememberCamera = useCallback((camera: CameraSource) => {
    setLastCamera(camera)
    writeLastCamera(camera)
  }, [])

  useEffect(() => {
    if (!isAuthenticated || !user || !isSupabaseConfigured) {
      setProject(null)
      setToolboxSessions([])
      setToolbox(null)
      setReports([])
      return
    }

    let cancelled = false
    setLoading(true)

    void (async () => {
      try {
        const projects = await fetchOwnedProjects()
        if (cancelled) return
        const savedId = localStorage.getItem(ACTIVE_PROJECT_KEY)
        const active =
          projects.find((p) => p.id === savedId) ?? projects[0] ?? null
        setProject(active)
        if (active) {
          localStorage.setItem(ACTIVE_PROJECT_KEY, active.id)
          const [sessions, reps] = await Promise.all([
            fetchSessionsForProject(active.id),
            fetchReportsForUser(),
          ])
          if (cancelled) return
          setToolboxSessions(sessions)
          setToolbox(sessions.find((s) => s.endedAt == null) ?? null)
          setReports(reps)
        } else {
          setToolboxSessions([])
          setToolbox(null)
          setReports([])
        }
      } catch (err) {
        console.error('[GearSight] Failed to load site data', err)
        if (!cancelled) {
          setProject(null)
          setToolboxSessions([])
          setToolbox(null)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [isAuthenticated, user])

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

  const createToolbox = useCallback(
    async (input: CreateToolboxInput) => {
      if (!user) throw new Error('Sign in to create a toolbox session')
      if (!project) throw new Error('No project found for this account')
      if (!isSupabaseConfigured) {
        throw new Error('Supabase is not configured')
      }

      const next = await createToolboxSession({
        projectId: project.id,
        createdBy: user.id,
        dateOfApplication: input.dateOfApplication.trim(),
        timeOfApplication: input.timeOfApplication.trim(),
        permitReceiver: input.permitReceiver.trim(),
        contractorCompanyName: input.contractorCompanyName.trim(),
        siteAddressName: input.siteAddressName.trim(),
        workType: input.workType,
        requiredPpe: input.requiredPpe,
        camera: input.camera,
        workers: input.workers,
      })
      if (input.camera) rememberCamera(input.camera)
      setToolbox(next)
      setToolboxSessions((prev) => [next, ...prev.filter((s) => s.id !== next.id)])
      return next
    },
    [user, project, rememberCamera],
  )

  const setToolboxCamera = useCallback(
    async (camera: CameraSource) => {
      if (!toolbox) return
      rememberCamera(camera)
      if (isSupabaseConfigured) {
        await updateSessionCamera(toolbox.id, camera)
      }
      const next: ToolboxSessionRecord = { ...toolbox, camera }
      setToolbox(next)
      setToolboxSessions((prev) =>
        prev.map((s) => (s.id === next.id ? next : s)),
      )
    },
    [toolbox, rememberCamera],
  )

  const clearToolbox = useCallback(async () => {
    const current = toolbox
    if (!current) return
    if (isSupabaseConfigured) {
      const closed = await endToolboxSession(current.id)
      if (closed) {
        setToolboxSessions((prev) =>
          prev.map((s) => (s.id === closed.id ? closed : s)),
        )
      }
    } else {
      const closed: ToolboxSessionRecord = {
        ...current,
        endedAt: new Date().toISOString(),
      }
      setToolboxSessions((prev) =>
        prev.map((s) => (s.id === closed.id ? closed : s)),
      )
    }
    setToolbox(null)
  }, [toolbox])

  const getToolboxSession = useCallback(
    (id: string) => toolboxSessions.find((s) => s.id === id) ?? null,
    [toolboxSessions],
  )

  const reportDetection = useCallback(
    async (input: ReportDetectionInput) => {
      if (!user) throw new Error('Sign in to report a detection')
      if (!isSupabaseConfigured) {
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
        setReports((prev) => [next, ...prev])
        return next
      }
      const next = await createWorkerReport({
        snapshotId: input.snapshotId,
        reportedBy: user.id,
        personLabel: input.personLabel,
        personDetectionId: input.personDetectionId,
        reason: input.reason?.trim() || 'PPE non-compliance follow-up',
      })
      setReports((prev) => [next, ...prev])
      return next
    },
    [user],
  )

  const captureSnapshot = useCallback(
    async (input: { image: Blob; people: PersonDetection[] }) => {
      if (!user) throw new Error('Sign in to capture a snapshot')
      if (!toolbox) throw new Error('Start a toolbox session first')
      if (!isSupabaseConfigured) {
        throw new Error('Supabase is not configured')
      }
      if (!project) throw new Error('No project loaded')

      const detail = await captureLiveSnapshot({
        userId: user.id,
        sessionId: toolbox.id,
        cameraLabel: toolbox.camera?.label ?? 'Camera',
        requiredPpe: toolbox.requiredPpe,
        image: input.image,
        people: input.people,
      })

      const listItem: SnapshotRecord = {
        id: detail.id,
        snapshotId: detail.snapshotId,
        previewUrl: detail.previewUrl,
        date: detail.date,
        time: detail.time,
        violationCount: detail.violationCount,
        status: detail.status,
      }
      setToolbox((current) =>
        current
          ? { ...current, snapshots: [listItem, ...current.snapshots] }
          : current,
      )
      setToolboxSessions((prev) =>
        prev.map((s) =>
          s.id === toolbox.id
            ? { ...s, snapshots: [listItem, ...s.snapshots] }
            : s,
        ),
      )
      return detail
    },
    [user, toolbox, project],
  )

  const value = useMemo<SiteContextValue>(
    () => ({
      projectId: project?.project_code ?? siteInfo.projectId,
      projectName: project?.name ?? siteInfo.name,
      isNewProject,
      recentSnapshots,
      toolbox,
      hasToolbox: Boolean(toolbox),
      toolboxSessions,
      reports,
      lastCamera,
      loading,
      createToolbox,
      setToolboxCamera,
      clearToolbox,
      getToolboxSession,
      reportDetection,
      captureSnapshot,
    }),
    [
      project,
      isNewProject,
      recentSnapshots,
      toolbox,
      toolboxSessions,
      reports,
      lastCamera,
      loading,
      createToolbox,
      setToolboxCamera,
      clearToolbox,
      getToolboxSession,
      reportDetection,
      captureSnapshot,
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

/** Re-export for callers that still import SnapshotRecord helpers */
export type { SnapshotRecord }
