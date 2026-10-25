import type { CSSProperties } from 'react'
import type { FrameDetection } from '@/lib/detectApi'
import type { BoundingBox, PersonDetection } from '@/types'

/** Distinct stroke per class, same idea as ultralytics result.plot(). */
const CLASS_COLORS: Record<string, string> = {
  person: '#4ade80',
  helmet: '#facc15',
  gloves: '#fb923c',
  high_visibility: '#a3e635',
  boots: '#c084fc',
  safety_glasses: '#22d3ee',
  harness: '#f472b6',
}

const PERSON_COLORS = {
  compliant: '#4ade80',
  non_compliant: '#ef4444',
  needs_checking: '#f59e0b',
} as const

const PPE_COLOR = '#3b82f6'
const PPE_PARTIAL_COLOR = '#f59e0b'

type DetectionOverlayProps = {
  people: PersonDetection[]
  /** Raw RT-DETR boxes. When present, these are drawn instead of the grouped people. */
  detections?: FrameDetection[]
  interactive?: boolean
  selectedPersonId?: string | null
  onSelectPerson?: (personId: string) => void
}

export function DetectionOverlay({
  people,
  detections,
  interactive = false,
  selectedPersonId,
  onSelectPerson,
}: DetectionOverlayProps) {
  return (
    <div className="pointer-events-none absolute inset-0">
      {detections
        ? detections.map((detection, index) => (
            <ClassBox key={`${detection.class}-${index}`} detection={detection} />
          ))
        : people.map((person) => (
            <PersonOverlay
              key={person.id}
              person={person}
              interactive={interactive}
              selected={selectedPersonId === person.id}
              onSelect={() => onSelectPerson?.(person.id)}
            />
          ))}
    </div>
  )
}

function ClassBox({ detection }: { detection: FrameDetection }) {
  const color = CLASS_COLORS[detection.class] ?? '#e5e7eb'
  const label = detection.class.replaceAll('_', ' ')
  return (
    <div
      className="absolute border-2"
      style={{ ...boxStyle(detection.box), borderColor: color }}
    >
      <span
        className="absolute left-0 top-0 max-w-[10rem] truncate px-1 py-px text-[9px] font-semibold uppercase text-black sm:text-[10px]"
        style={{ backgroundColor: color }}
      >
        {label} {Math.round(detection.confidence * 100)}
      </span>
    </div>
  )
}

function PersonOverlay({
  person,
  interactive,
  selected,
  onSelect,
}: {
  person: PersonDetection
  interactive: boolean
  selected: boolean
  onSelect: () => void
}) {
  const color = PERSON_COLORS[person.status]
  const box = boxStyle(person.box)

  return (
    <>
      {interactive ? (
        <button
          type="button"
          aria-label={`Select ${person.label}`}
          onClick={onSelect}
          className="pointer-events-auto absolute border-[2.5px] bg-transparent transition"
          style={{
            ...box,
            borderColor: color,
            boxShadow: selected ? `0 0 0 2px ${color}` : undefined,
          }}
        >
          <PersonLabel label={person.label} color={color} />
        </button>
      ) : (
        <div
          className="absolute border-[2.5px]"
          style={{ ...box, borderColor: color }}
        >
          <PersonLabel label={person.label} color={color} />
        </div>
      )}

      {person.ppe.map((item) => {
        if (!item.box) return null
        const partial =
          item.requiredCount != null &&
          item.detectedCount != null &&
          item.detectedCount < item.requiredCount
        const stroke = partial || !item.detected ? PPE_PARTIAL_COLOR : PPE_COLOR
        return (
          <span
            key={item.id}
            className="absolute border-2"
            style={{ ...boxStyle(item.box), borderColor: stroke }}
            title={item.label}
          >
            <span
              className="absolute left-0 top-0 max-w-[8rem] truncate px-1 py-px text-[9px] font-semibold text-white sm:text-[10px]"
              style={{ backgroundColor: stroke }}
            >
              {item.label}
            </span>
          </span>
        )
      })}
    </>
  )
}

function PersonLabel({ label, color }: { label: string; color: string }) {
  return (
    <span
      className="absolute left-0 top-0 max-w-full truncate px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white sm:text-xs"
      style={{ backgroundColor: color }}
    >
      {label}
    </span>
  )
}

function boxStyle(box: BoundingBox): CSSProperties {
  return {
    left: `${box.x}%`,
    top: `${box.y}%`,
    width: `${box.w}%`,
    height: `${box.h}%`,
  }
}
