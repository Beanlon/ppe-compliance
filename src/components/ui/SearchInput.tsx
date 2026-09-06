import { Search } from 'lucide-react'

interface SearchInputProps {
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  className?: string
  size?: 'md' | 'lg'
}

export function SearchInput({
  placeholder = 'Search…',
  value,
  onChange,
  className = '',
  size = 'md',
}: SearchInputProps) {
  const sizing =
    size === 'lg'
      ? 'h-11 px-4 text-sm'
      : 'h-10 px-3.5 text-sm'

  return (
    <label
      className={`flex items-center gap-2 rounded-full bg-[#eceef2] text-gray-500 ${sizing} ${className}`}
    >
      <Search className="h-4 w-4 shrink-0 opacity-70" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent outline-none placeholder:text-gray-400 text-gray-800"
      />
    </label>
  )
}
