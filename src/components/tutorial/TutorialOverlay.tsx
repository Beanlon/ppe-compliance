import { useCallback, useEffect, useId, useState } from 'react'
import {
  Camera,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Gauge,
  HardHat,
  Lightbulb,
  MapPinned,
  ShieldCheck,
  Video,
  X,
  type LucideIcon,
} from 'lucide-react'

type TutorialStep = {
  title: string
  subtitle: string
  body: string
  points: string[]
  tip: string
  icon: LucideIcon
  tone: 'navy' | 'green' | 'orange'
}

const STEPS: TutorialStep[] = [
  {
    title: 'Welcome to GearSight',
    subtitle: 'PPE compliance for active worksites',
    body: 'GearSight helps safety officers monitor personal protective equipment on construction sites. AI highlights likely gaps so you can verify issues faster—while final safety decisions stay with you.',
    points: [
      'Watch live camera feeds from the worksite',
      'Review snapshot records for audits and follow-ups',
      'Track compliance signals against required PPE rules',
    ],
    tip: 'Open this tutorial anytime from Help → Show Tutorial in the sidebar.',
    icon: ShieldCheck,
    tone: 'navy',
  },
  {
    title: 'Live Feed',
    subtitle: 'Your home monitoring screen',
    body: 'Live Feed is where day-to-day monitoring happens. Check the active camera view, compliance benchmark, today’s summary, and recent snapshots in one place.',
    points: [
      'Switch or confirm the connected camera source',
      'Watch for AI-flagged PPE issues in real time',
      'Use Recent Snapshots to jump into a flagged moment',
    ],
    tip: 'Treat AI flags as alerts to investigate—not automatic violations.',
    icon: Video,
    tone: 'orange',
  },
  {
    title: 'Compliance benchmark',
    subtitle: 'Read the site pulse at a glance',
    body: 'The benchmark card summarizes high-level compliance, model accuracy, and PPE detection. Status counts show compliant, non-compliant, and needs-checking cases.',
    points: [
      'High compliance reflects overall site readiness',
      'Model accuracy and PPE detection show system confidence',
      'Status pills help prioritize what to review next',
    ],
    tip: 'A drop in compliance is a signal to open Records and inspect recent flags.',
    icon: Gauge,
    tone: 'green',
  },
  {
    title: 'Records',
    subtitle: 'History you can search and review',
    body: 'Records stores dated snapshots from monitoring. Search by snapshot ID or date, switch between list and grid views, and open entries to follow up on flagged gear.',
    points: [
      'Filter snapshots by ID, date, or time',
      'Toggle list or grid depending on how you review',
      'Use violation badges to spot non-compliant moments fast',
    ],
    tip: 'Keep Records handy for audits, toolbox talks, and shift handovers.',
    icon: ClipboardList,
    tone: 'navy',
  },
  {
    title: 'PPE & site setup',
    subtitle: 'Rules the AI checks against',
    body: 'Each project defines required gear—vests/shirts, shoes, gloves, harnesses, hard hats, and more. Detection compares what the camera sees with those site rules.',
    points: [
      'Set required PPE when creating or configuring a project',
      'Pin the worksite location so context stays with the project',
      'Update gear requirements when site conditions change',
    ],
    tip: 'Accurate PPE setup keeps detection useful for your specific worksite.',
    icon: HardHat,
    tone: 'green',
  },
  {
    title: 'You are ready',
    subtitle: 'Monitor, verify, act',
    body: 'You now know the core loop: watch Live Feed, check benchmarks, review Records, and keep PPE rules current. GearSight assists—officers remain accountable for final calls.',
    points: [
      'Start shifts on Live Feed',
      'Investigate flags in Records when needed',
      'Revisit this guide from Help whenever you want a refresher',
    ],
    tip: 'Pair GearSight alerts with on-site judgment and clear officer follow-up.',
    icon: Camera,
    tone: 'orange',
  },
]

const toneStyles = {
  navy: {
    icon: 'bg-navy text-white',
    subtitle: 'text-navy',
    bar: 'bg-navy',
    tip: 'border-navy/15 bg-[#eef1f7]',
    tipIcon: 'text-navy',
  },
  green: {
    icon: 'bg-[#16a34a] text-white',
    subtitle: 'text-[#15803d]',
    bar: 'bg-[#16a34a]',
    tip: 'border-[#bbf7d0] bg-[#f0fdf4]',
    tipIcon: 'text-[#16a34a]',
  },
  orange: {
    icon: 'bg-accent text-white',
    subtitle: 'text-[#c2410c]',
    bar: 'bg-accent',
    tip: 'border-[#fed7aa] bg-[#fff7ed]',
    tipIcon: 'text-accent',
  },
}

type TutorialOverlayProps = {
  open: boolean
  onClose: () => void
}

export function TutorialOverlay({ open, onClose }: TutorialOverlayProps) {
  const titleId = useId()
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState<'next' | 'back'>('next')
  const [contentKey, setContentKey] = useState(0)

  const advanceContent = useCallback((nextStep: number, dir: 'next' | 'back') => {
    setDirection(dir)
    setContentKey((k) => k + 1)
    setStep(nextStep)
  }, [])

  const goNext = useCallback(() => {
    if (step >= STEPS.length - 1) {
      onClose()
      return
    }
    advanceContent(step + 1, 'next')
  }, [advanceContent, onClose, step])

  const goBack = useCallback(() => {
    if (step <= 0) return
    advanceContent(step - 1, 'back')
  }, [advanceContent, step])

  const goTo = useCallback(
    (index: number) => {
      if (index === step) return
      advanceContent(index, index > step ? 'next' : 'back')
    },
    [advanceContent, step],
  )

  useEffect(() => {
    if (!open) return
    setStep(0)
    setDirection('next')
    setContentKey((k) => k + 1)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') goNext()
      if (e.key === 'ArrowLeft') goBack()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose, goNext, goBack])

  if (!open) return null

  const current = STEPS[step]
  const Icon = current.icon
  const styles = toneStyles[current.tone]
  const isLast = step === STEPS.length - 1
  const progress = ((step + 1) / STEPS.length) * 100

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center p-3 sm:items-center sm:p-6">
      <button
        type="button"
        aria-label="Dismiss tutorial"
        className="tutorial-backdrop-in absolute inset-0 bg-navy/75 backdrop-blur-[3px]"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="tutorial-panel-in relative z-10 flex max-h-[min(92vh,720px)] w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl shadow-black/35"
      >
        <div className="h-1.5 w-full bg-gray-100">
          <div
            className={`h-full transition-[width] duration-300 ease-out ${styles.bar}`}
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-start justify-between gap-3 px-5 pt-4 sm:px-6 sm:pt-5">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent">
              Tutorial · Step {step + 1} of {STEPS.length}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {STEPS.map((item, i) => (
                <button
                  key={item.title}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`Go to step ${i + 1}: ${item.title}`}
                  aria-current={i === step ? 'step' : undefined}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === step
                      ? `w-7 ${styles.bar}`
                      : i < step
                        ? 'w-2 bg-navy/35 hover:bg-navy/55'
                        : 'w-2 bg-gray-200 hover:bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-muted transition hover:bg-gray-100 hover:text-ink"
            aria-label="Close tutorial"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div
          key={contentKey}
          className={`min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6 sm:py-6 ${
            direction === 'next' ? 'tutorial-step-next' : 'tutorial-step-back'
          }`}
        >
          <div className="flex items-start gap-4">
            <span
              className={`tutorial-icon-pop inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl shadow-sm ${styles.icon}`}
            >
              <Icon className="h-7 w-7" strokeWidth={2.25} />
            </span>
            <div className="min-w-0 pt-0.5">
              <h2
                id={titleId}
                className="text-xl font-bold tracking-tight text-ink sm:text-2xl"
              >
                {current.title}
              </h2>
              <p className={`mt-1 text-sm font-semibold ${styles.subtitle}`}>
                {current.subtitle}
              </p>
            </div>
          </div>

          <p className="mt-5 text-sm leading-relaxed text-muted sm:text-[0.95rem]">
            {current.body}
          </p>

          <ul className="mt-5 space-y-2.5">
            {current.points.map((point) => (
              <li key={point} className="flex items-start gap-2.5 text-sm text-ink">
                <CheckCircle2
                  className={`mt-0.5 h-4 w-4 shrink-0 ${styles.tipIcon}`}
                  strokeWidth={2.5}
                />
                <span className="leading-snug">{point}</span>
              </li>
            ))}
          </ul>

          <div
            className={`tutorial-tip-in mt-5 flex gap-3 rounded-xl border p-3.5 sm:p-4 ${styles.tip}`}
          >
            <Lightbulb
              className={`mt-0.5 h-5 w-5 shrink-0 ${styles.tipIcon}`}
              strokeWidth={2.25}
            />
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-ink/70">
                Quick tip
              </p>
              <p className="mt-1 text-sm leading-relaxed text-ink/90">
                {current.tip}
              </p>
            </div>
          </div>

          {step === 0 ? (
            <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-3">
              {[
                { icon: Video, label: 'Live Feed' },
                { icon: ClipboardList, label: 'Records' },
                { icon: MapPinned, label: 'Site setup' },
              ].map((item) => {
                const Mini = item.icon
                return (
                  <div
                    key={item.label}
                    className="rounded-xl border border-gray-200 bg-surface/80 px-2 py-3 text-center"
                  >
                    <Mini className="mx-auto h-4 w-4 text-navy" strokeWidth={2.25} />
                    <p className="mt-1.5 text-[11px] font-semibold text-ink sm:text-xs">
                      {item.label}
                    </p>
                  </div>
                )
              })}
            </div>
          ) : null}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-gray-100 bg-surface/70 px-5 py-4 sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className="text-sm font-semibold text-muted transition hover:text-ink"
          >
            Skip tour
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={goBack}
              disabled={step === 0}
              className="inline-flex h-10 items-center justify-center gap-1 rounded-full border border-gray-200 bg-white px-3.5 text-sm font-semibold text-ink transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-35"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </button>
            <button
              type="button"
              onClick={goNext}
              className="inline-flex h-10 min-w-[8rem] items-center justify-center gap-1 rounded-full bg-navy px-5 text-sm font-semibold text-white transition hover:bg-[#24314d]"
            >
              {isLast ? 'Finish' : 'Next'}
              {!isLast ? <ChevronRight className="h-4 w-4" /> : null}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
