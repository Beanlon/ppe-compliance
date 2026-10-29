import { isSupabaseConfigured, supabase } from '@/lib/supabaseClient'
import type {
  Json,
  ProjectRow,
  SessionWorkerRow,
  SnapshotRow,
  ToolboxSessionRow,
  WorkerReportRow,
} from '@/types/database'
import type {
  BoundingBox,
  CameraSource,
  ComplianceStatus,
  PersonDetection,
  PpeDetection,
  SnapshotDetail,
  SnapshotRecord,
  ToolboxSessionRecord,
  ToolboxWorkerEntry,
  WorkType,
  WorkerReport,
} from '@/types'

export type CreateProjectInput = {
  projectCode: string
  name: string
  address: string
  lat: number
  lng: number
  createdBy: string
}

export type CreateSessionInput = {
  projectId: string
  createdBy: string
  dateOfApplication: string
  timeOfApplication: string
  permitReceiver: string
  contractorCompanyName: string
  siteAddressName: string
  workType: WorkType
  requiredPpe: string[]
  camera: CameraSource | null
  workers: ToolboxWorkerEntry[]
}

function requireSupabase() {
  if (!isSupabaseConfigured) {
    throw new Error(
      'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local.',
    )
  }
}

export function displayName(first: string, last: string) {
  return [first.trim(), last.trim()].filter(Boolean).join(' ') || 'User'
}

export async function fetchProfile(userId: string) {
  requireSupabase()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function createProject(input: CreateProjectInput): Promise<ProjectRow> {
  requireSupabase()
  const { data, error } = await supabase
    .from('projects')
    .insert({
      project_code: input.projectCode,
      name: input.name,
      address: input.address,
      lat: input.lat,
      lng: input.lng,
      created_by: input.createdBy,
    })
    .select('*')
    .single()
  if (error) throw error
  return data
}

export async function fetchOwnedProjects(): Promise<ProjectRow[]> {
  requireSupabase()
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function fetchProjectByCode(
  projectCode: string,
): Promise<ProjectRow | null> {
  requireSupabase()
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('project_code', projectCode.trim())
    .maybeSingle()
  if (error) throw error
  return data
}

function mapSnapshot(row: SnapshotRow, previewUrl = ''): SnapshotRecord {
  return {
    id: row.id,
    snapshotId: row.snapshot_code,
    previewUrl: previewUrl || row.preview_path || '',
    date: row.captured_date ?? '',
    time: row.captured_time ?? '',
    violationCount: row.violation_count,
    status: row.status,
  }
}

async function mapSnapshotsWithUrls(
  rows: SnapshotRow[],
): Promise<SnapshotRecord[]> {
  return Promise.all(
    rows.map(async (row) => {
      const path = row.preview_path || row.image_path
      if (!path) return mapSnapshot(row)
      try {
        const url = await getSnapshotSignedUrl(path)
        return mapSnapshot(row, url)
      } catch {
        return mapSnapshot(row)
      }
    }),
  )
}

function mapSession(
  row: ToolboxSessionRow,
  workers: SessionWorkerRow[],
  snapshots: SnapshotRecord[],
): ToolboxSessionRecord {
  return {
    id: row.id,
    dateOfApplication: row.date_of_application,
    timeOfApplication: row.time_of_application,
    permitReceiver: row.permit_receiver,
    contractorCompanyName: row.contractor_company_name,
    siteAddressName: row.site_address_name,
    workers: workers.map((w) => ({
      id: w.id,
      name: w.name,
      position: w.position,
    })),
    workType: row.work_type,
    requiredPpe: row.required_ppe ?? [],
    ...(row.camera_device_id && row.camera_label
      ? {
          camera: {
            deviceId: row.camera_device_id,
            label: row.camera_label,
          },
        }
      : {}),
    createdAt: row.created_at,
    endedAt: row.ended_at,
    snapshots,
  }
}

export async function fetchSessionsForProject(
  projectId: string,
): Promise<ToolboxSessionRecord[]> {
  requireSupabase()
  const { data: sessions, error } = await supabase
    .from('toolbox_sessions')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
  if (error) throw error
  if (!sessions?.length) return []

  const ids = sessions.map((s) => s.id)
  const [{ data: workers, error: wErr }, { data: snaps, error: sErr }] =
    await Promise.all([
      supabase.from('session_workers').select('*').in('session_id', ids),
      supabase.from('snapshots').select('*').in('session_id', ids),
    ])
  if (wErr) throw wErr
  if (sErr) throw sErr

  const workersBySession = new Map<string, SessionWorkerRow[]>()
  for (const w of workers ?? []) {
    const list = workersBySession.get(w.session_id) ?? []
    list.push(w)
    workersBySession.set(w.session_id, list)
  }
  const snapsBySession = new Map<string, SnapshotRow[]>()
  for (const sn of snaps ?? []) {
    const list = snapsBySession.get(sn.session_id) ?? []
    list.push(sn)
    snapsBySession.set(sn.session_id, list)
  }

  return Promise.all(
    sessions.map(async (row) => {
      const rawSnaps = (snapsBySession.get(row.id) ?? []).sort((a, b) =>
        a.created_at < b.created_at ? 1 : -1,
      )
      const snapshots = await mapSnapshotsWithUrls(rawSnaps)
      return mapSession(row, workersBySession.get(row.id) ?? [], snapshots)
    }),
  )
}

export async function createToolboxSession(
  input: CreateSessionInput,
): Promise<ToolboxSessionRecord> {
  requireSupabase()
  const { data: session, error } = await supabase
    .from('toolbox_sessions')
    .insert({
      project_id: input.projectId,
      date_of_application: input.dateOfApplication,
      time_of_application: input.timeOfApplication,
      permit_receiver: input.permitReceiver,
      contractor_company_name: input.contractorCompanyName,
      site_address_name: input.siteAddressName,
      work_type: input.workType,
      required_ppe: input.requiredPpe,
      camera_device_id: input.camera?.deviceId ?? null,
      camera_label: input.camera?.label ?? null,
      created_by: input.createdBy,
      ended_at: null,
    })
    .select('*')
    .single()
  if (error) throw error

  const crew = input.workers
    .map((w) => ({
      session_id: session.id,
      name: w.name.trim(),
      position: w.position.trim(),
    }))
    .filter((w) => w.name && w.position)

  let workers: SessionWorkerRow[] = []
  if (crew.length > 0) {
    const { data, error: wErr } = await supabase
      .from('session_workers')
      .insert(crew)
      .select('*')
    if (wErr) throw wErr
    workers = data ?? []
  }

  return mapSession(session, workers, [])
}

export async function endToolboxSession(
  sessionId: string,
): Promise<ToolboxSessionRecord | null> {
  requireSupabase()
  const endedAt = new Date().toISOString()
  const { data, error } = await supabase
    .from('toolbox_sessions')
    .update({ ended_at: endedAt })
    .eq('id', sessionId)
    .select('*')
    .single()
  if (error) throw error

  const [{ data: workers }, { data: snaps }] = await Promise.all([
    supabase.from('session_workers').select('*').eq('session_id', sessionId),
    supabase.from('snapshots').select('*').eq('session_id', sessionId),
  ])
  const snapshotRecords = await mapSnapshotsWithUrls(snaps ?? [])
  return mapSession(data, workers ?? [], snapshotRecords)
}

export async function updateSessionCamera(
  sessionId: string,
  camera: CameraSource,
): Promise<void> {
  requireSupabase()
  const { error } = await supabase
    .from('toolbox_sessions')
    .update({
      camera_device_id: camera.deviceId,
      camera_label: camera.label,
    })
    .eq('id', sessionId)
  if (error) throw error
}

export async function fetchReportsForUser(): Promise<WorkerReport[]> {
  requireSupabase()
  const { data, error } = await supabase
    .from('worker_reports')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []).map(mapReport)
}

function mapReport(row: WorkerReportRow): WorkerReport {
  return {
    id: row.id,
    workerId: row.reported_by,
    workerName: '',
    snapshotId: row.snapshot_id,
    personLabel: row.person_label,
    personDetectionId: row.person_detection_id,
    reason: row.reason,
    createdAt: row.created_at,
  }
}

export async function createWorkerReport(input: {
  snapshotId: string
  reportedBy: string
  personLabel: string
  personDetectionId: string
  reason?: string
}): Promise<WorkerReport> {
  requireSupabase()
  const { data, error } = await supabase
    .from('worker_reports')
    .insert({
      snapshot_id: input.snapshotId,
      reported_by: input.reportedBy,
      person_label: input.personLabel,
      person_detection_id: input.personDetectionId,
      reason: input.reason ?? 'Reported from snapshot review',
    })
    .select('*')
    .single()
  if (error) throw error
  return mapReport(data)
}

export async function uploadSnapshotImage(
  userId: string,
  sessionId: string,
  file: Blob,
  fileName: string,
): Promise<string> {
  requireSupabase()
  const path = `${userId}/${sessionId}/${fileName}`
  const { error } = await supabase.storage
    .from('snapshots')
    .upload(path, file, { upsert: true, contentType: file.type || 'image/jpeg' })
  if (error) throw error
  return path
}

export async function getSnapshotSignedUrl(path: string): Promise<string> {
  requireSupabase()
  const { data, error } = await supabase.storage
    .from('snapshots')
    .createSignedUrl(path, 60 * 60)
  if (error) throw error
  return data.signedUrl
}

export async function createSnapshotRecord(input: {
  sessionId: string
  snapshotCode: string
  previewPath?: string | null
  imagePath?: string | null
  capturedDate?: string | null
  capturedTime?: string | null
  violationCount?: number
  status?: SnapshotRecord['status']
}): Promise<SnapshotRecord> {
  requireSupabase()
  const { data, error } = await supabase
    .from('snapshots')
    .insert({
      session_id: input.sessionId,
      snapshot_code: input.snapshotCode,
      preview_path: input.previewPath ?? null,
      image_path: input.imagePath ?? null,
      captured_date: input.capturedDate ?? null,
      captured_time: input.capturedTime ?? null,
      violation_count: input.violationCount ?? 0,
      status: input.status ?? 'compliant',
    })
    .select('*')
    .single()
  if (error) throw error
  return mapSnapshot(data)
}

function asBox(value: unknown): BoundingBox | undefined {
  if (!value || typeof value !== 'object') return undefined
  const box = value as Partial<BoundingBox>
  if (
    typeof box.x !== 'number' ||
    typeof box.y !== 'number' ||
    typeof box.w !== 'number' ||
    typeof box.h !== 'number'
  ) {
    return undefined
  }
  return { x: box.x, y: box.y, w: box.w, h: box.h }
}

function countPersonGaps(person: PersonDetection): number {
  return person.ppe.filter((item) => {
    if (item.id.includes('-extra-')) return false
    return !item.detected
  }).length
}

function overallStatus(
  people: PersonDetection[],
): ComplianceStatus {
  if (people.length === 0) return 'needs_checking'
  if (people.every((p) => p.status === 'compliant')) return 'compliant'
  if (people.some((p) => p.status === 'non_compliant')) return 'non_compliant'
  return 'needs_checking'
}

function formatCaptureDate(d = new Date()) {
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function formatCaptureTime(d = new Date()) {
  let hours = d.getHours()
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const period = hours >= 12 ? 'PM' : 'AM'
  hours = hours % 12
  if (hours === 0) hours = 12
  return `${String(hours).padStart(2, '0')}:${minutes} ${period}`
}

/** Persist a live frame + people/PPE into Storage and related tables. */
export async function captureLiveSnapshot(input: {
  userId: string
  sessionId: string
  cameraLabel: string
  requiredPpe: string[]
  image: Blob
  people: PersonDetection[]
}): Promise<SnapshotDetail> {
  requireSupabase()
  const now = new Date()
  const stamp = now.toISOString().replace(/[:.]/g, '-')
  const snapshotCode = `SSID-${now.getFullYear()}-${String(now.getTime()).slice(-6)}`
  const fileName = `${stamp}.jpg`
  const path = await uploadSnapshotImage(
    input.userId,
    input.sessionId,
    input.image,
    fileName,
  )

  const violationCount = input.people.reduce(
    (sum, person) => sum + countPersonGaps(person),
    0,
  )
  const status = overallStatus(input.people)
  const record = await createSnapshotRecord({
    sessionId: input.sessionId,
    snapshotCode,
    previewPath: path,
    imagePath: path,
    capturedDate: formatCaptureDate(now),
    capturedTime: formatCaptureTime(now),
    violationCount,
    status,
  })

  for (const person of input.people) {
    const { data: personRow, error: personErr } = await supabase
      .from('snapshot_people')
      .insert({
        snapshot_id: record.id,
        label: person.label,
        status: person.status,
        box: person.box as unknown as Json,
      })
      .select('*')
      .single()
    if (personErr) throw personErr

    const ppeRows = person.ppe.map((item) => ({
      person_id: personRow.id,
      label: item.label,
      detected: item.detected,
      confidence: item.confidence ?? null,
      required_count: item.requiredCount ?? null,
      detected_count: item.detectedCount ?? null,
      box: (item.box ?? null) as Json | null,
    }))
    if (ppeRows.length > 0) {
      const { error: ppeErr } = await supabase.from('ppe_detections').insert(ppeRows)
      if (ppeErr) throw ppeErr
    }
  }

  const imageUrl = await getSnapshotSignedUrl(path)
  return {
    ...record,
    previewUrl: imageUrl,
    imageUrl,
    cameraLabel: input.cameraLabel,
    requiredPpe: input.requiredPpe,
    people: input.people,
  }
}

export async function fetchSnapshotDetail(
  snapshotId: string,
): Promise<SnapshotDetail | null> {
  requireSupabase()
  const { data: snap, error } = await supabase
    .from('snapshots')
    .select('*')
    .eq('id', snapshotId)
    .maybeSingle()
  if (error) throw error
  if (!snap) return null

  const { data: session } = await supabase
    .from('toolbox_sessions')
    .select('camera_label, required_ppe')
    .eq('id', snap.session_id)
    .maybeSingle()

  const { data: peopleRows, error: peopleErr } = await supabase
    .from('snapshot_people')
    .select('*')
    .eq('snapshot_id', snapshotId)
  if (peopleErr) throw peopleErr

  const personIds = (peopleRows ?? []).map((p) => p.id)
  const { data: ppeRows, error: ppeErr } =
    personIds.length > 0
      ? await supabase.from('ppe_detections').select('*').in('person_id', personIds)
      : { data: [], error: null }
  if (ppeErr) throw ppeErr

  const ppeByPerson = new Map<string, PpeDetection[]>()
  for (const row of ppeRows ?? []) {
    const list = ppeByPerson.get(row.person_id) ?? []
    list.push({
      id: row.id,
      label: row.label,
      detected: row.detected,
      confidence: row.confidence ?? undefined,
      requiredCount: row.required_count ?? undefined,
      detectedCount: row.detected_count ?? undefined,
      box: asBox(row.box),
    })
    ppeByPerson.set(row.person_id, list)
  }

  const people: PersonDetection[] = (peopleRows ?? []).map((row) => ({
    id: row.id,
    label: row.label,
    status: row.status,
    box: asBox(row.box) ?? { x: 0, y: 0, w: 0, h: 0 },
    ppe: ppeByPerson.get(row.id) ?? [],
  }))

  let imageUrl = ''
  const path = snap.image_path || snap.preview_path
  if (path) {
    try {
      imageUrl = await getSnapshotSignedUrl(path)
    } catch {
      imageUrl = ''
    }
  }

  return {
    id: snap.id,
    snapshotId: snap.snapshot_code,
    previewUrl: imageUrl,
    date: snap.captured_date ?? '',
    time: snap.captured_time ?? '',
    violationCount: snap.violation_count,
    status: snap.status,
    imageUrl,
    cameraLabel: session?.camera_label ?? 'Camera',
    requiredPpe: session?.required_ppe ?? [],
    people,
  }
}
