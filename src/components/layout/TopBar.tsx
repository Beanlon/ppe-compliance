import { SearchInput } from '@/components/ui/SearchInput'
import { useAuth } from '@/context/AuthContext'

export function TopBar() {
  const { user } = useAuth()
  const initial = user?.name?.charAt(0).toUpperCase() ?? 'A'

  return (
    <header className="flex items-center justify-between gap-6 px-8 py-5">
      <SearchInput
        size="lg"
        placeholder="Search for records, workers, snapshots etc."
        className="max-w-xl flex-1"
      />
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#d1d5db] text-sm font-bold text-gray-700">
          {initial}
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-gray-900">
            {user?.name ?? 'Admin'}
          </p>
          <p className="text-xs text-gray-500">
            {user?.email ?? 'account@gmail.com'}
          </p>
        </div>
      </div>
    </header>
  )
}
