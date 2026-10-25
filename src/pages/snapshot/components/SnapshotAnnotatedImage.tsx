import { DetectionOverlay } from '@/components/detection/DetectionOverlay'
import type { SnapshotDetail } from '@/types'

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
    <div className="relative aspect-video w-full shrink-0 overflow-hidden bg-[#1a1a1a]">
      <img
        src={detail.imageUrl}
        alt={`Snapshot ${detail.snapshotId}`}
        className="absolute inset-0 h-full w-full object-cover"
      />

      <DetectionOverlay
        people={detail.people}
        interactive
        selectedPersonId={selectedPersonId}
        onSelectPerson={onSelectPerson}
      />
    </div>
  )
}
