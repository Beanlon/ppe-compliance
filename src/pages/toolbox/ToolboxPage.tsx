import { useMemo, useState, type FormEvent, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CheckCircle2,
  ClipboardList,
  Plus,
  Square,
  Trash2,
} from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { AppPageFrame } from '@/components/layout/AppPageFrame'
import { useAuth } from '@/context/AuthContext'
import { useSite } from '@/context/SiteContext'
import { siteInfo } from '@/data/mock'
import type { ToolboxWorkerEntry, WorkType } from '@/types'

const inputClass =
  'w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition focus:border-navy focus:ring-[3px] focus:ring-navy/15'

const inputReadonlyClass =
  'w-full cursor-not-allowed rounded-xl border border-gray-200 bg-surface px-3.5 py-2.5 text-sm text-ink'

const PPE_OPTIONS = [
  'Helmet',
  'Gloves',
  'High Visibility Suit',
  'Boots',
  'Safety Glasses',
  'Harness',
] as const

function formatDateMMDDYYYY(d = new Date()) {
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const yyyy = d.getFullYear()
  return `${mm}-${dd}-${yyyy}`
}

function formatTimeAMPM(d = new Date()) {
  let hours = d.getHours()
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const period = hours >= 12 ? 'PM' : 'AM'
  hours = hours % 12
  if (hours === 0) hours = 12
  return `${String(hours).padStart(2, '0')}:${minutes} ${period}`
}

function newWorkerRow(): ToolboxWorkerEntry {
  return {
    id: `tw-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: '',
    position: '',
  }
}

export function ToolboxPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { toolbox, hasToolbox, createToolbox, clearToolbox, projectName } =
    useSite()

  const permitReceiver = user?.name ?? 'Admin'
  const dateOfApplication = useMemo(() => formatDateMMDDYYYY(), [])
  const timeOfApplication = useMemo(() => formatTimeAMPM(), [])
  const siteAddressName = siteInfo.address

  const [contractorCompanyName, setContractorCompanyName] = useState('')
  const [workers, setWorkers] = useState<ToolboxWorkerEntry[]>(() => [
    newWorkerRow(),
  ])
  const [workType, setWorkType] = useState<WorkType>('ground')
  const [requiredPpe, setRequiredPpe] = useState<string[]>([
    'Helmet',
    'High Visibility Suit',
    'Boots',
  ])

  const filledWorkers = useMemo(
    () => workers.filter((w) => w.name.trim() && w.position.trim()),
    [workers],
  )

  function updateWorker(
    id: string,
    field: 'name' | 'position',
    value: string,
  ) {
    setWorkers((prev) =>
      prev.map((w) => (w.id === id ? { ...w, [field]: value } : w)),
    )
  }

  function addWorkerRow() {
    setWorkers((prev) => [...prev, newWorkerRow()])
  }

  function removeWorkerRow(id: string) {
    setWorkers((prev) => {
      if (prev.length <= 1) {
        return [{ ...prev[0], name: '', position: '' }]
      }
      return prev.filter((w) => w.id !== id)
    })
  }

  function togglePpe(label: string) {
    setRequiredPpe((prev) =>
      prev.includes(label) ? prev.filter((x) => x !== label) : [...prev, label],
    )
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (
      !dateOfApplication.trim() ||
      !timeOfApplication.trim() ||
      !contractorCompanyName.trim() ||
      !siteAddressName.trim() ||
      filledWorkers.length === 0 ||
      requiredPpe.length === 0
    ) {
      return
    }

    createToolbox({
      dateOfApplication,
      timeOfApplication,
      permitReceiver,
      contractorCompanyName,
      siteAddressName,
      workers: filledWorkers,
      workType,
      requiredPpe,
    })
    navigate('/')
  }

  if (hasToolbox && toolbox) {
    return (
      <AppPageFrame padded>
        <PageHeader
          title="Toolbox"
          subtitle={`Work session for ${projectName}`}
        />

        <div className="rounded-2xl border border-[#bbf7d0] bg-[#f0fdf4] px-4 py-3 sm:px-5">
          <div className="flex items-start gap-3">
            <CheckCircle2
              className="mt-0.5 h-5 w-5 shrink-0 text-[#16a34a]"
              strokeWidth={2.25}
            />
            <div>
              <p className="text-sm font-bold text-ink">Toolbox session on record</p>
              <p className="mt-0.5 text-sm text-muted">
                Live Feed monitoring is unlocked for this shift.
              </p>
            </div>
          </div>
        </div>

        <article className="mt-5 rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-navy text-white">
              <ClipboardList className="h-5 w-5" strokeWidth={2.25} />
            </span>
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-ink">
                {toolbox.workType === 'arboreal' ? 'Arboreal' : 'Ground'} work
                session
              </h2>
              <p className="mt-1 text-sm text-muted">
                {toolbox.dateOfApplication} · {toolbox.timeOfApplication} ·
                Permit receiver {toolbox.permitReceiver}
              </p>
            </div>
          </div>

          <dl className="mt-5 grid gap-4 sm:grid-cols-2">
            <SummaryItem label="Contractor company">
              {toolbox.contractorCompanyName}
            </SummaryItem>
            <SummaryItem label="Site address">
              {toolbox.siteAddressName}
            </SummaryItem>
            <SummaryItem label="Work type">
              {toolbox.workType === 'arboreal' ? 'Arboreal' : 'Ground'}
            </SummaryItem>
            <SummaryItem label="Workers">
              {toolbox.workers.length} listed
            </SummaryItem>
          </dl>

          <div className="mt-4 border-t border-gray-100 pt-4">
            <p className="text-xs font-bold uppercase tracking-wide text-muted">
              Workers
            </p>
            <ul className="mt-2 divide-y divide-gray-100 rounded-xl border border-gray-200">
              {toolbox.workers.map((w) => (
                <li
                  key={w.id}
                  className="flex flex-wrap items-baseline justify-between gap-2 px-3 py-2.5"
                >
                  <span className="text-sm font-semibold text-ink">{w.name}</span>
                  <span className="text-sm text-muted">{w.position}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-4 border-t border-gray-100 pt-4">
            <p className="text-xs font-bold uppercase tracking-wide text-muted">
              PPE required
            </p>
            {toolbox.requiredPpe.length === 0 ? (
              <p className="mt-2 text-sm text-muted">No PPE selected.</p>
            ) : (
              <ul className="mt-2 flex flex-wrap gap-2">
                {toolbox.requiredPpe.map((item) => (
                  <li
                    key={item}
                    className="rounded-full border border-[#bbf7d0] bg-[#f0fdf4] px-3 py-1 text-xs font-semibold text-[#166534]"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="inline-flex h-10 items-center justify-center rounded-full bg-navy px-5 text-sm font-semibold text-white transition hover:bg-[#24314d]"
            >
              Open Live Feed
            </button>
            <button
              type="button"
              onClick={() => {
                clearToolbox()
                navigate('/')
              }}
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full bg-[#dc2626] px-5 text-sm font-semibold text-white transition hover:bg-[#b91c1c]"
            >
              <Square className="h-3.5 w-3.5 fill-current" />
              End session
            </button>
          </div>
        </article>
      </AppPageFrame>
    )
  }

  return (
    <AppPageFrame padded>
      <PageHeader
        title="Toolbox"
        subtitle={`Record today’s work session for ${projectName}`}
      />

      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-gray-200 bg-white p-3 sm:p-4"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Date of Application (MM-DD-YYYY)" htmlFor="tb-date">
            <input
              id="tb-date"
              value={dateOfApplication}
              readOnly
              tabIndex={-1}
              className={inputReadonlyClass}
              aria-readonly="true"
            />
          </Field>
          <Field label="Time of Application (HH:MM AM/PM)" htmlFor="tb-time">
            <input
              id="tb-time"
              value={timeOfApplication}
              readOnly
              tabIndex={-1}
              className={inputReadonlyClass}
              aria-readonly="true"
            />
          </Field>
          <Field label="Permit Receiver" htmlFor="tb-receiver">
            <input
              id="tb-receiver"
              value={permitReceiver}
              readOnly
              tabIndex={-1}
              className={inputReadonlyClass}
              aria-readonly="true"
            />
          </Field>
          <Field label="Contractor Company Name" htmlFor="tb-company">
            <input
              id="tb-company"
              value={contractorCompanyName}
              onChange={(e) => setContractorCompanyName(e.target.value)}
              required
              className={inputClass}
              placeholder="Company name"
            />
          </Field>
          <Field
            label="Site Address Name"
            htmlFor="tb-address"
            className="sm:col-span-2"
          >
            <input
              id="tb-address"
              value={siteAddressName}
              readOnly
              tabIndex={-1}
              className={inputReadonlyClass}
              aria-readonly="true"
            />
          </Field>
        </div>

        <fieldset className="mt-5">
          <legend className="text-sm font-bold text-ink">
            Workers ({filledWorkers.length})
          </legend>
          <p className="mt-1 text-sm text-muted">
            Enter each worker’s name and position / work. Add rows if you need
            more.
          </p>

          <ul className="mt-3 space-y-3">
            {workers.map((worker, index) => (
              <li
                key={worker.id}
                className="grid gap-3 rounded-xl border border-gray-200 bg-surface/40 p-3 sm:grid-cols-[1fr_1fr_auto]"
              >
                <Field
                  label={index === 0 ? 'Name' : `Name ${index + 1}`}
                  htmlFor={`tb-worker-name-${worker.id}`}
                >
                  <input
                    id={`tb-worker-name-${worker.id}`}
                    value={worker.name}
                    onChange={(e) =>
                      updateWorker(worker.id, 'name', e.target.value)
                    }
                    className={inputClass}
                    placeholder="Worker name"
                    required={index === 0}
                  />
                </Field>
                <Field
                  label={index === 0 ? 'Position / Work' : `Position ${index + 1}`}
                  htmlFor={`tb-worker-role-${worker.id}`}
                >
                  <input
                    id={`tb-worker-role-${worker.id}`}
                    value={worker.position}
                    onChange={(e) =>
                      updateWorker(worker.id, 'position', e.target.value)
                    }
                    className={inputClass}
                    placeholder="Position or work"
                    required={index === 0}
                  />
                </Field>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => removeWorkerRow(worker.id)}
                    className="inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold text-muted transition hover:bg-gray-50 hover:text-ink sm:w-10"
                    aria-label={`Remove worker row ${index + 1}`}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sm:hidden">Remove</span>
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={addWorkerRow}
            className="mt-3 inline-flex h-10 items-center justify-center gap-1.5 rounded-full border border-gray-200 bg-white px-4 text-sm font-semibold text-ink transition hover:bg-gray-50"
          >
            <Plus className="h-4 w-4" />
            Add worker
          </button>
        </fieldset>

        <fieldset className="mt-5">
          <legend className="text-sm font-bold text-ink">Select Work Type</legend>
          <div
            role="group"
            aria-label="Work type"
            className="mt-3 inline-flex rounded-full border border-gray-200 bg-surface p-1"
          >
            <WorkTypeButton
              active={workType === 'ground'}
              onClick={() => setWorkType('ground')}
            >
              Ground
            </WorkTypeButton>
            <WorkTypeButton
              active={workType === 'arboreal'}
              onClick={() => setWorkType('arboreal')}
            >
              Arboreal
            </WorkTypeButton>
          </div>
        </fieldset>

        <fieldset className="mt-5">
          <legend className="text-sm font-bold text-ink">
            Select PPE required ({requiredPpe.length})
          </legend>
          <p className="mt-1 text-sm text-muted">
            Check which PPE is required for this work session.
          </p>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {PPE_OPTIONS.map((item) => {
              const checked = requiredPpe.includes(item)
              return (
                <li key={item}>
                  <label
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 transition ${
                      checked
                        ? 'border-navy/30 bg-[#eef1f7]'
                        : 'border-gray-200 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => togglePpe(item)}
                      className="h-4 w-4 rounded border-gray-300 text-navy focus:ring-navy"
                    />
                    <span className="text-sm font-semibold text-ink">{item}</span>
                  </label>
                </li>
              )
            })}
          </ul>
        </fieldset>

        <div className="mt-6 flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={
              filledWorkers.length === 0 ||
              requiredPpe.length === 0 ||
              !contractorCompanyName.trim() ||
              !siteAddressName.trim()
            }
            className="inline-flex h-10 items-center justify-center rounded-full bg-navy px-5 text-sm font-semibold text-white transition hover:bg-[#24314d] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Save toolbox & open Live Feed
          </button>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="inline-flex h-10 items-center justify-center rounded-full border border-gray-200 bg-white px-5 text-sm font-semibold text-ink transition hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </AppPageFrame>
  )
}

function WorkTypeButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
        active
          ? 'bg-navy text-white shadow-sm'
          : 'text-muted hover:text-ink'
      }`}
    >
      {children}
    </button>
  )
}

function Field({
  label,
  htmlFor,
  children,
  className = '',
}: {
  label: string
  htmlFor: string
  children: ReactNode
  className?: string
}) {
  return (
    <div className={className}>
      <label
        htmlFor={htmlFor}
        className="mb-1.5 block text-sm font-semibold text-ink"
      >
        {label}
      </label>
      {children}
    </div>
  )
}

function SummaryItem({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div>
      <dt className="text-xs font-bold uppercase tracking-wide text-muted">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-semibold text-ink">{children}</dd>
    </div>
  )
}
