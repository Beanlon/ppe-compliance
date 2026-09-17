import type { CSSProperties } from 'react'
import type { BoundingBox, PersonDetection, SnapshotDetail } from '@/types'

const PERSON_COLORS = {
  compliant: '#4ade80',
  non_compliant: '#ef4444',
  needs_checking: '#f59e0b',
} as const

const PPE_COLOR = '#3b82f6'
const PPE_PARTIAL_COLOR = '#f59e0b'

interface SnapshotAnnotatedImageProps {
  detail: SnapshotDetail
  selectedPersonId?: string | null
  onSelectPerson?: (personId: string) => void
}

export function SnapshotAnnotatedImage({
  detail,
  selectedPersonId,
  onSelectPerson,
}: SnapshotAnnotatedImageProps) {
  return (
    <div className="relative aspect-video w-full overflow-hidden bg-[#1a1a1a]">
      <img
        src={detail.imageUrl}
        alt={`Snapshot ${detail.snapshotId}`}
        className="absolute inset-0 h-full w-full object-cover"
      />

      {detail.people.map((person) => (
        <PersonOverlay
          key={person.id}
          person={person}
          selected={selectedPersonId === person.id}
          onSelect={() => onSelectPerson?.(person.id)}
        />
      ))}
    </div>
  )
}

function PersonOverlay({
  person,
  selected,
  onSelect,
}: {
  person: PersonDetection
  selected: boolean
  onSelect: () => void
}) {
  const color = PERSON_COLORS[person.status]

  return (
    <>
      <button
        type="button"
        aria-label={`Select ${person.label}`}
        onClick={onSelect}
        className="absolute border-[2.5px] bg-transparent transition"
        style={{
          ...boxStyle(person.box),
          borderColor: color,
          boxShadow: selected ? `0 0 0 2px ${color}` : undefined,
        }}
      >
        <span
          className="absolute left-0 top-0 max-w-full truncate px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white sm:text-xs"
          style={{ backgroundColor: color }}
        >
          {person.label}
        </span>
      </button>

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
            className="pointer-events-none absolute border-2"
            style={{
              ...boxStyle(item.box),
              borderColor: stroke,
            }}
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

function boxStyle(box: BoundingBox): CSSProperties {
  return {
    left: `${box.x}%`,
    top: `${box.y}%`,
    width: `${box.w}%`,
    height: `${box.h}%`,
  }
}
