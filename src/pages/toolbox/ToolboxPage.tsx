import { useMemo, useState, type FormEvent, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CheckCircle2, ClipboardList, Plus, Square, UserRound, Users, X } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { SearchInput } from '@/components/ui/SearchInput'
import { useSite } from '@/context/SiteContext'
import { siteInfo } from '@/data/mock'
import type { Worker } from '@/types'

const inputClass =
  'w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition focus:border-navy focus:ring-[3px] focus:ring-navy/15'

/** PPE options available to mark active for today’s work */
const PPE_OPTIONS = [
  'Safety Vest / Shirt',
  'Safety Shoes',
  'Gloves',
  'Harness',
  'Hard Hat',
  'Safety Glasses',
  'Ear Protection',
] as const

export function ToolboxPage() {
  const navigate = useNavigate()
  const { toolbox, hasToolbox, workers, createToolbox, clearToolbox, projectName } =
    useSite()

  const [title, setTitle] = useState('Pre-shift toolbox talk')
  const [topic, setTopic] = useState('Required PPE and fall hazards')
  const [conductedBy, setConductedBy] = useState('Admin')
  const [date, setDate] = useState(siteInfo.currentDate)
  const [time, setTime] = useState(siteInfo.currentTime)
  const [notes, setNotes] = useState('')
  const [attendeeIds, setAttendeeIds] = useState<string[]>([])
  const [attendeeQuery, setAttendeeQuery] = useState('')
  const [activePpe, setActivePpe] = useState<string[]>([
    'Safety Vest / Shirt',
    'Safety Shoes',
    'Hard Hat',
    'Harness',
  ])

  const attendees = useMemo(
    () =>
      attendeeIds
        .map((id) => workers.find((w) => w.id === id))
        .filter((w): w is Worker => Boolean(w)),
    [attendeeIds, workers],
  )

  const searchResults = useMemo(() => {
    const q = attendeeQuery.trim().toLowerCase()
    if (!q) return []
    return workers.filter(
      (w) =>
        !attendeeIds.includes(w.id) &&
        (w.name.toLowerCase().includes(q) ||
          w.role.toLowerCase().includes(q) ||
          (w.phone?.toLowerCase().includes(q) ?? false)),
    )
  }, [workers, attendeeIds, attendeeQuery])

  function addAttendee(id: string) {
    setAttendeeIds((prev) => (prev.includes(id) ? prev : [...prev, id]))
    setAttendeeQuery('')
  }

  function removeAttendee(id: string) {
    setAttendeeIds((prev) => prev.filter((x) => x !== id))
  }

  function togglePpe(label: string) {
    setActivePpe((prev) =>
      prev.includes(label) ? prev.filter((x) => x !== label) : [...prev, label],
    )
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (
      !title.trim() ||
      !topic.trim() ||
      attendeeIds.length === 0 ||
      activePpe.length === 0
    ) {
      return
    }
    createToolbox({
      title,
      topic,
      conductedBy,
      date,
      time,
      notes,
      attendeeIds,
      activePpe,
    })
    navigate('/')
  }

  if (hasToolbox && toolbox) {
    const savedAttendees = workers.filter((w) =>
      toolbox.attendeeIds.includes(w.id),
    )
    const todayPpe = toolbox.activePpe ?? []
    return (
      <div className="w-full">
        <PageHeader
          title="Toolbox"
          subtitle={`Pre-work briefing for ${projectName}`}
        />

        <div className="rounded-2xl border border-[#bbf7d0] bg-[#f0fdf4] px-4 py-3 sm:px-5">
          <div className="flex items-start gap-3">
            <CheckCircle2
              className="mt-0.5 h-5 w-5 shrink-0 text-[#16a34a]"
              strokeWidth={2.25}
            />
            <div>
              <p className="text-sm font-bold text-ink">Toolbox talk on record</p>
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
              <h2 className="text-lg font-bold text-ink">{toolbox.title}</h2>
              <p className="mt-1 text-sm text-muted">
                {toolbox.date} · {toolbox.time} · Conducted by{' '}
                {toolbox.conductedBy}
              </p>
            </div>
          </div>

          <dl className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-bold uppercase tracking-wide text-muted">
                Topic
              </dt>
              <dd className="mt-1 text-sm font-semibold text-ink">
                {toolbox.topic}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase tracking-wide text-muted">
                Attendees
              </dt>
              <dd className="mt-1 text-sm font-semibold text-ink">
                {savedAttendees.length} workers
              </dd>
            </div>
          </dl>

          {toolbox.notes ? (
            <div className="mt-4 border-t border-gray-100 pt-4">
              <p className="text-xs font-bold uppercase tracking-wide text-muted">
                Notes
              </p>
              <p className="mt-1 text-sm leading-relaxed text-ink">
                {toolbox.notes}
              </p>
            </div>
          ) : null}

          <div className="mt-4 border-t border-gray-100 pt-4">
            <p className="text-xs font-bold uppercase tracking-wide text-muted">
              PPE active today
            </p>
            {todayPpe.length === 0 ? (
              <p className="mt-2 text-sm text-muted">No PPE marked for today.</p>
            ) : (
              <ul className="mt-2 flex flex-wrap gap-2">
                {todayPpe.map((item) => (
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

          <div className="mt-4 border-t border-gray-100 pt-4">
            <p className="text-xs font-bold uppercase tracking-wide text-muted">
              Crew present
            </p>
            <ul className="mt-2 flex flex-wrap gap-2">
              {savedAttendees.map((w) => (
                <li
                  key={w.id}
                  className="rounded-full border border-gray-200 bg-surface px-3 py-1 text-xs font-semibold text-ink"
                >
                  {w.name}
                </li>
              ))}
            </ul>
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
              onClick={() => navigate('/workers')}
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full border border-gray-200 bg-white px-5 text-sm font-semibold text-ink transition hover:bg-gray-50"
            >
              <Users className="h-4 w-4" />
              View workers
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
      </div>
    )
  }

  return (
    <div className="w-full">
      <PageHeader
        title="Toolbox"
        subtitle={`Record today’s pre-work briefing for ${projectName}`}
      />

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Title" htmlFor="tb-title">
            <input
              id="tb-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className={inputClass}
            />
          </Field>
          <Field label="Topic" htmlFor="tb-topic">
            <input
              id="tb-topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              required
              className={inputClass}
            />
          </Field>
          <Field label="Conducted by" htmlFor="tb-by">
            <input
              id="tb-by"
              value={conductedBy}
              onChange={(e) => setConductedBy(e.target.value)}
              required
              className={inputClass}
            />
          </Field>
          <Field label="Date" htmlFor="tb-date">
            <input
              id="tb-date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className={inputClass}
            />
          </Field>
          <Field label="Time" htmlFor="tb-time">
            <input
              id="tb-time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
              className={inputClass}
            />
          </Field>
        </div>

        <Field label="Notes (optional)" htmlFor="tb-notes" className="mt-4">
          <textarea
            id="tb-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className={`${inputClass} min-h-[5.5rem] resize-y`}
            placeholder="Hazards, PPE reminders, permit notes…"
          />
        </Field>

        <fieldset className="mt-5">
          <legend className="text-sm font-bold text-ink">
            PPE active today ({activePpe.length})
          </legend>
          <p className="mt-1 text-sm text-muted">
            Check which PPE is required or in use for today’s work.
          </p>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {PPE_OPTIONS.map((item) => {
              const checked = activePpe.includes(item)
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

        <fieldset className="mt-5">
          <legend className="text-sm font-bold text-ink">
            Attendees ({attendees.length})
          </legend>
          <p className="mt-1 text-sm text-muted">
            Search for workers, then add them to today’s toolbox talk.
          </p>

          {workers.length === 0 ? (
            <div className="mt-3 rounded-xl border border-dashed border-gray-200 bg-surface/60 px-4 py-5 text-center">
              <p className="text-sm font-semibold text-ink">
                No workers registered yet
              </p>
              <p className="mt-1 text-sm text-muted">
                Add crew on the Workers page before assigning attendees.
              </p>
              <Link
                to="/workers"
                className="mt-3 inline-flex h-9 items-center justify-center rounded-full bg-navy px-4 text-sm font-semibold text-white transition hover:bg-[#24314d]"
              >
                Go to Workers
              </Link>
            </div>
          ) : (
            <>
              <div className="relative mt-3">
                <SearchInput
                  value={attendeeQuery}
                  onChange={setAttendeeQuery}
                  placeholder="Search by name or role"
                  className="w-full"
                />
                {attendeeQuery.trim() ? (
                  <ul className="absolute z-20 mt-1.5 max-h-56 w-full overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg">
                    {searchResults.length === 0 ? (
                      <li className="px-3 py-3 text-sm text-muted">
                        No matching workers to add.
                      </li>
                    ) : (
                      searchResults.map((worker) => (
                        <li key={worker.id} className="border-b border-gray-50 last:border-0">
                          <button
                            type="button"
                            onClick={() => addAttendee(worker.id)}
                            className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition hover:bg-gray-50"
                          >
                            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface text-navy">
                              <UserRound className="h-4 w-4" strokeWidth={2.25} />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm font-semibold text-ink">
                                {worker.name}
                              </span>
                              <span className="block truncate text-xs text-muted">
                                {worker.role}
                                {worker.phone ? ` · ${worker.phone}` : null}
                              </span>
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-full bg-navy px-2.5 py-1 text-xs font-semibold text-white">
                              <Plus className="h-3.5 w-3.5" />
                              Add
                            </span>
                          </button>
                        </li>
                      ))
                    )}
                  </ul>
                ) : null}
              </div>

              {attendees.length > 0 ? (
                <ul className="mt-3 flex flex-wrap gap-2">
                  {attendees.map((worker) => (
                    <li
                      key={worker.id}
                      className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-surface pl-3 pr-1.5 py-1 text-sm font-semibold text-ink"
                    >
                      {worker.name}
                      <button
                        type="button"
                        onClick={() => removeAttendee(worker.id)}
                        className="rounded-full p-1 text-muted transition hover:bg-white hover:text-ink"
                        aria-label={`Remove ${worker.name}`}
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-muted">
                  No attendees added yet.
                </p>
              )}
            </>
          )}
        </fieldset>

        <div className="mt-6 flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={attendeeIds.length === 0 || activePpe.length === 0}
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
    </div>
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
