import { useMemo, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { SearchInput } from '@/components/ui/SearchInput'
import { RecordsTable } from '@/components/records/RecordsTable'
import { snapshots } from '@/data/mock'

export function RecordsPage() {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return snapshots
    return snapshots.filter(
      (s) =>
        s.snapshotId.toLowerCase().includes(q) ||
        s.date.includes(q) ||
        s.time.toLowerCase().includes(q),
    )
  }, [query])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-950">
          Records
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          List of snapshots with and without violations with accuracy score.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search for records, workers, snapshots etc."
          className="w-full max-w-md"
        />
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm ring-1 ring-gray-200"
        >
          Latest
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>

      <RecordsTable rows={filtered} />
    </div>
  )
}
