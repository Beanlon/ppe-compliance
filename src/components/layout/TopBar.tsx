import { SearchInput } from '@/components/ui/SearchInput'
import { useAuth } from '@/context/AuthContext'

export function TopBar() {
  const { user } = useAuth()
  const initial = user?.name?.charAt(0).toUpperCase() ?? 'A'

  return (
    <header className="sticky top-0 z-20 border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:h-[4.25rem] sm:px-6 lg:px-8">
        <SearchInput
          size="lg"
          placeholder="Search for records, workers, snapshots etc."
          className="max-w-xl flex-1"
        />
        <div className="flex shrink-0 items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#d1d5db] text-sm font-bold text-gray-700">
            {initial}
          </div>
          <div className="hidden leading-tight sm:block">
            <p className="text-sm font-semibold text-gray-900">
              {user?.name ?? 'Admin'}
            </p>
            <p className="text-xs text-gray-500">
              {user?.email ?? 'account@gmail.com'}
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}
