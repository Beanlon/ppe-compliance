import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const isSupabaseConfigured = Boolean(url && anonKey)

if (!isSupabaseConfigured) {
  console.warn(
    '[GearSight] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Auth and cloud data are disabled until .env.local is set.',
  )
}

/** Singleton browser client. Safe no-op URL when env is missing so imports don't crash. */
export const supabase: SupabaseClient<Database> = createClient<Database>(
  url || 'https://placeholder.supabase.co',
  anonKey || 'placeholder-anon-key',
)
