import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { ppeOptions, workers } from '@/data/mock'
import type { PpeItem } from '@/types'

export function ToolboxCreatePage() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('Morning Safety Briefing')
  const [selectedWorkers, setSelectedWorkers] = useState<string[]>([
    'w-1',
    'w-2',
  ])
  const [requiredPpe, setRequiredPpe] = useState<PpeItem[]>([
    'Hard Hat',
    'Safety Vest',
    'Safety Boots',
  ])

  function toggleWorker(id: string) {
    setSelectedWorkers((prev) =>
      prev.includes(id) ? prev.filter((w) => w !== id) : [...prev, id],
    )
  }

  function togglePpe(item: PpeItem) {
    setRequiredPpe((prev) =>
      prev.includes(item) ? prev.filter((p) => p !== item) : [...prev, item],
    )
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    navigate('/')
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-950">
          Create Toolbox Session
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Record attendance and define required PPE before starting work.
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        className="space-y-6 rounded-2xl bg-white p-6 shadow-sm"
      >
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Session title</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-brand"
          />
        </label>

        <fieldset>
          <legend className="mb-3 text-sm font-semibold text-gray-900">
            Record toolbox attendance
          </legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {workers
              .filter((w) => w.status === 'active')
              .map((worker) => (
                <label
                  key={worker.id}
                  className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 px-3 py-3 text-sm hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={selectedWorkers.includes(worker.id)}
                    onChange={() => toggleWorker(worker.id)}
                    className="accent-brand-dark"
                  />
                  <span>
                    <span className="block font-medium">{worker.name}</span>
                    <span className="text-xs text-gray-500">
                      {worker.employeeId} · {worker.trade}
                    </span>
                  </span>
                </label>
              ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-3 text-sm font-semibold text-gray-900">
            Define required PPE
          </legend>
          <div className="flex flex-wrap gap-2">
            {ppeOptions.map((item) => {
              const active = requiredPpe.includes(item)
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => togglePpe(item)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    active
                      ? 'bg-brand text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {item}
                </button>
              )
            })}
          </div>
        </fieldset>

        <div className="flex flex-wrap gap-3">
          <Button type="submit">Save Toolbox & Start Work Session</Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate(-1)}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
