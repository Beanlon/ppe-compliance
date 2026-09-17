import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { User, UserRole } from '@/types'

interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  /** True for one cycle after login — Live Feed uses this to gate the toolbox prompt */
  justLoggedIn: boolean
  login: (email: string, role: UserRole) => void
  logout: () => void
  /** Clear the one-shot login flag after Live Feed has handled it */
  consumeJustLoggedIn: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [justLoggedIn, setJustLoggedIn] = useState(false)

  const login = useCallback((email: string, role: UserRole) => {
    setUser({
      id: 'u-session',
      name: role === 'safety_officer' ? 'Admin' : 'Site Engineer',
      email,
      role,
    })
    setJustLoggedIn(true)
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setJustLoggedIn(false)
  }, [])

  const consumeJustLoggedIn = useCallback(() => {
    setJustLoggedIn(false)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      justLoggedIn,
      login,
      logout,
      consumeJustLoggedIn,
    }),
    [user, justLoggedIn, login, logout, consumeJustLoggedIn],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
