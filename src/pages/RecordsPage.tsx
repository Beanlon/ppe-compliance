import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { ChevronDown, ChevronLeft, ChevronRight, LayoutGrid, List } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { SearchInput } from '@/components/ui/SearchInput'
import { RecordsGrid, RecordsList } from '@/components/records/RecordsViews'
import { snapshots } from '@/data/mock'

type ViewMode = 'list' | 'grid'

const PAGE_SIZE_LIST = 5
const PAGE_SIZE_GRID = 6

export function RecordsPage() {
  const [query, setQuery] = useState('')
  const [view, setView] = useState<ViewMode>('list')
  const [page, setPage] = useState(1)

  const pageSize = view === 'list' ? PAGE_SIZE_LIST : PAGE_SIZE_GRID

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return snapshots
    return snapshots.filter(
      (s) =>
        s.snapshotId.toLowerCase().includes(q) ||
        s.date.toLowerCase().includes(q) ||
        s.time.toLowerCase().includes(q),
    )
  }, [query])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))

  useEffect(() => {
    setPage(1)
  }, [query, view])

  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])

  const pageRows = useMemo(() => {
    const start = (page - 1) * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, page, pageSize])

  const from = filtered.length === 0 ? 0 : (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, filtered.length)

  return (
    <div className="w-full">
      <PageHeader
        title="Records"
        subtitle="Displays all of the recorded snapshots"
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search"
          className="w-full min-w-0 flex-1 sm:min-w-[200px] sm:max-w-2xl"
        />

        <div className="flex flex-wrap items-center gap-2">
          <ViewToggle
            active={view === 'list'}
            label="List view"
            onClick={() => setView('list')}
          >
            <List className="h-4 w-4" />
          </ViewToggle>
          <ViewToggle
            active={view === 'grid'}
            label="Grid view"
            onClick={() => setView('grid')}
          >
            <LayoutGrid className="h-4 w-4" />
          </ViewToggle>

          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700"
          >
            Filter
            <ChevronDown className="h-4 w-4 text-gray-500" />
          </button>
        </div>
      </div>

      <p className="mt-4 text-sm text-muted">
        {filtered.length} results found
        {filtered.length > 0 ? (
          <span className="text-gray-400">
            {' '}
            · Showing {from}–{to}
          </span>
        ) : null}
      </p>

      <div className="mt-4">
        {view === 'list' ? (
          <RecordsList rows={pageRows} />
        ) : (
          <RecordsGrid rows={pageRows} />
        )}
      </div>

      {filtered.length > 0 ? (
        <Pagination
          page={page}
          totalPages={totalPages}
          onChange={setPage}
        />
      ) : null}
    </div>
  )
}

function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number
  totalPages: number
  onChange: (page: number) => void
}) {
  const pages = useMemo(() => getPageNumbers(page, totalPages), [page, totalPages])

  return (
    <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 pt-4">
      <p className="text-sm text-muted">
        Page {page} of {totalPages}
      </p>

      <div className="flex flex-wrap items-center gap-1.5">
        <PageButton
          label="Previous page"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
        </PageButton>

        {pages.map((item, index) =>
          item === '…' ? (
            <span
              key={`ellipsis-${index}`}
              className="px-1.5 text-sm text-muted"
            >
              …
            </span>
          ) : (
            <PageButton
              key={item}
              label={`Page ${item}`}
              active={item === page}
              onClick={() => onChange(item)}
            >
              {item}
            </PageButton>
          ),
        )}

        <PageButton
          label="Next page"
          disabled={page >= totalPages}
          onClick={() => onChange(page + 1)}
        >
          <ChevronRight className="h-4 w-4" />
        </PageButton>
      </div>
    </div>
  )
}

function PageButton({
  children,
  label,
  onClick,
  disabled,
  active,
}: {
  children: ReactNode
  label: string
  onClick: () => void
  disabled?: boolean
  active?: boolean
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-current={active ? 'page' : undefined}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex h-9 min-w-9 items-center justify-center rounded-lg border px-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${
        active
          ? 'border-ink bg-ink text-white'
          : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
      }`}
    >
      {children}
    </button>
  )
}

function getPageNumbers(page: number, totalPages: number): Array<number | '…'> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }

  if (page <= 3) {
    return [1, 2, 3, 4, '…', totalPages]
  }

  if (page >= totalPages - 2) {
    return [1, '…', totalPages - 3, totalPages - 2, totalPages - 1, totalPages]
  }

  return [1, '…', page - 1, page, page + 1, '…', totalPages]
}

function ViewToggle({
  active,
  label,
  onClick,
  children,
}: {
  active: boolean
  label: string
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
      className={`inline-flex h-10 w-10 items-center justify-center rounded-lg border transition ${
        active
          ? 'border-ink bg-ink text-white'
          : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'
      }`}
    >
      {children}
    </button>
  )
}
