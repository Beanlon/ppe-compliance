interface SnapshotThumbProps {
  src: string
  className?: string
}

/** Thumbnail with detection boxes matching the Records mockups */
export function SnapshotThumb({ src, className = '' }: SnapshotThumbProps) {
  return (
    <div className={`relative overflow-hidden bg-gray-100 ${className}`}>
      <img src={src} alt="" className="h-full w-full object-cover" />
      <span className="pointer-events-none absolute left-[18%] top-[18%] h-[55%] w-[18%] rounded-[3px] border-[2.5px] border-[#4ade80]" />
      <span className="pointer-events-none absolute left-[42%] top-[22%] h-[50%] w-[16%] rounded-[3px] border-[2.5px] border-[#4ade80]" />
      <span className="pointer-events-none absolute left-[62%] top-[20%] h-[52%] w-[17%] rounded-[3px] border-[2.5px] border-[#4ade80]" />
    </div>
  )
}
