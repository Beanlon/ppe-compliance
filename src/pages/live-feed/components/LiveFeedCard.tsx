import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown, VideoOff } from 'lucide-react'
import { useSite } from '@/context/SiteContext'
import { useCameraDevices } from '@/hooks/useCameraDevices'
import { useCameraStream } from '@/hooks/useCameraStream'
import { resolveCamera } from '@/lib/camera'
import type { CameraSource } from '@/types'

type LiveFeedCardProps = {
  /** When false, show a blank white panel instead of the camera feed */
  active?: boolean
}

export function LiveFeedCard({ active = true }: LiveFeedCardProps) {
  if (!active) {
    return (
      <div className="relative aspect-video w-full shrink-0 overflow-hidden border-b border-gray-100 bg-white">
        <div className="absolute inset-0 flex flex-col items-center justify-center px-4">
          <p className="text-sm font-semibold text-gray-400">No live feed</p>
          <p className="mt-1 text-xs text-gray-300">
            Waiting for today’s toolbox talk
          </p>
        </div>
      </div>
    )
  }

  return <CameraFeed />
}

function CameraFeed() {
  const { toolbox, setToolboxCamera } = useSite()
  const saved = toolbox?.camera ?? null
  const {
    cameras,
    status: devicesStatus,
    error: devicesError,
    refresh,
    reload,
    refreshing,
  } = useCameraDevices()
  const selected = resolveCamera(cameras, saved)
  const {
    videoRef,
    status: streamStatus,
    error: streamError,
    retry,
  } = useCameraStream(selected?.deviceId ?? null)
  const [menuOpen, setMenuOpen] = useState(false)

  // Same camera, new device ID (e.g. browser storage was reset)
  useEffect(() => {
    if (selected && saved && selected.deviceId !== saved.deviceId) {
      setToolboxCamera(selected)
    }
  }, [selected, saved, setToolboxCamera])

  function openMenu() {
    setMenuOpen(true)
    void refresh()
  }

  const live = streamStatus === 'live'

  function chooseCamera(camera: CameraSource) {
    // Re-picking the current camera is the natural way to reconnect it
    if (camera.deviceId === selected?.deviceId && !live) retry()
    setToolboxCamera(camera)
    setMenuOpen(false)
  }

  async function reloadAndReconnect() {
    await reload()
    if (!live) retry()
  }
  let message = ''
  let action: 'choose' | 'retry' | null = null

  if (devicesStatus === 'loading') {
    message = 'Detecting cameras…'
  } else if (devicesStatus === 'none') {
    message = 'No camera found on this machine.'
    action = 'retry'
  } else if (devicesStatus !== 'ready') {
    message = devicesError
    action = 'retry'
  } else if (!saved) {
    message = 'Choose a camera to start the live feed.'
    action = 'choose'
  } else if (!selected) {
    message = `${saved.label} is not connected. Plug it back in or choose another camera.`
    action = 'choose'
  } else if (streamStatus === 'starting' || streamStatus === 'idle') {
    message = `Connecting to ${selected.label}…`
  } else if (streamStatus === 'missing') {
    message = streamError
    action = 'choose'
  } else if (!live) {
    message = streamError
    action = 'retry'
  }

  return (
    <div className="relative aspect-video w-full shrink-0 overflow-hidden bg-[#1a1a1a]">
      <video
        ref={videoRef}
        muted
        playsInline
        autoPlay
        className={`absolute inset-0 h-full w-full object-cover ${live ? 'block' : 'hidden'}`}
      />

      {!live && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center text-white/70">
          <VideoOff className="h-8 w-8" strokeWidth={1.5} />
          <p className="max-w-sm text-sm">{message}</p>
          {action === 'choose' && (
            <button
              type="button"
              onClick={openMenu}
              className="mt-1 rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-ink transition hover:bg-gray-100 sm:text-sm"
            >
              Choose camera
            </button>
          )}
          {action === 'retry' && (
            <button
              type="button"
              disabled={refreshing}
              onClick={() => void reloadAndReconnect()}
              className="mt-1 rounded-full border border-white/30 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-white/10 sm:text-sm"
            >
              Retry
            </button>
          )}
        </div>
      )}

      {live && (
        <div className="absolute left-3 top-3 inline-flex items-center gap-2 rounded-lg bg-black/55 px-2.5 py-1.5 text-xs font-bold uppercase tracking-wide text-white sm:left-4 sm:top-4 sm:px-3 sm:text-sm">
          <span className="h-2 w-2 rounded-full bg-[#ef4444]" />
          Live
        </div>
      )}

      <CameraMenu
        open={menuOpen}
        label={selected?.label ?? saved?.label ?? 'Select camera'}
        cameras={cameras}
        selectedId={selected?.deviceId ?? null}
        onOpen={openMenu}
        onClose={() => setMenuOpen(false)}
        onChoose={chooseCamera}
      />
    </div>
  )
}

function CameraMenu({
  open,
  label,
  cameras,
  selectedId,
  onOpen,
  onClose,
  onChoose,
}: {
  open: boolean
  label: string
  cameras: CameraSource[]
  selectedId: string | null
  onOpen: () => void
  onClose: () => void
  onChoose: (camera: CameraSource) => void
}) {
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onPointer(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) onClose()
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', onPointer)
    window.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointer)
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  return (
    <div
      ref={rootRef}
      className="pointer-events-none absolute inset-x-3 top-3 flex flex-col items-end sm:inset-x-4 sm:top-4"
    >
      <button
        type="button"
        onClick={open ? onClose : onOpen}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="pointer-events-auto flex max-w-[60%] items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-800 sm:px-3 sm:text-sm"
      >
        <span className="truncate">{label}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 shrink-0 text-gray-500 transition ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="pointer-events-auto mt-1.5 w-64 max-w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg shadow-black/20">
          <ul role="listbox" aria-label="Cameras" className="max-h-60 overflow-y-auto py-1">
            {cameras.length === 0 ? (
              <li className="px-3 py-2 text-sm text-muted">No cameras detected</li>
            ) : (
              cameras.map((cam) => {
                const isSelected = cam.deviceId === selectedId
                return (
                  <li key={cam.deviceId} role="option" aria-selected={isSelected}>
                    <button
                      type="button"
                      onClick={() => onChoose(cam)}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-ink transition hover:bg-gray-50"
                    >
                      <Check
                        className={`h-4 w-4 shrink-0 text-navy ${isSelected ? 'visible' : 'invisible'}`}
                      />
                      <span className="truncate">{cam.label}</span>
                    </button>
                  </li>
                )
              })
            )}
          </ul>
        </div>
      )}
    </div>
  )
}
