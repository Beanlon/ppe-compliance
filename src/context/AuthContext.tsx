import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type Context,
  type ReactNode,
} from 'react'
import type { User, UserRole } from '@/types'
import { siteInfo } from '@/data/mock'
import {
  confirmChallengeCode,
  createChallenge,
  type PhoneLocation,
  type SitePin,
} from '@/lib/verifyApi'

export type PendingLogin = {
  email: string
  role: UserRole
  projectId: string
  challengeId: string
  site: SitePin
  expiresAt: number
}

interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  pendingLogin: PendingLogin | null
  lastPhoneLocation: PhoneLocation | null
  /** True for one cycle after login — Live Feed uses this to gate the toolbox prompt */
  justLoggedIn: boolean
  /** Step 1 complete: credentials accepted, start QR challenge */
  startSiteVerification: (
    email: string,
    role: UserRole,
    projectId: string,
  ) => Promise<PendingLogin>
  /** Step 4: code from phone unlocks the app */
  completeSiteVerification: (code: string) => Promise<void>
  clearPendingLogin: () => void
  login: (email: string, role: UserRole) => void
  logout: () => void
  /** Clear the one-shot login flag after Live Feed has handled it */
  consumeJustLoggedIn: () => void
}

/** Preserve context identity across Vite HMR so hooks don't crash to a white screen */
const AUTH_CONTEXT_KEY = '__gearsightAuthContext'
const globalStore = globalThis as unknown as Record<
  string,
  Context<AuthContextValue | null> | undefined
>
const AuthContext =
  globalStore[AUTH_CONTEXT_KEY] ?? createContext<AuthContextValue | null>(null)
globalStore[AUTH_CONTEXT_KEY] = AuthContext

function sitePinForProject(projectId: string): SitePin {
  return {
    name: siteInfo.name,
    address: siteInfo.address,
    projectId: projectId.trim() || siteInfo.projectId,
    lat: siteInfo.lat,
    lng: siteInfo.lng,
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [pendingLogin, setPendingLogin] = useState<PendingLogin | null>(null)
  const [lastPhoneLocation, setLastPhoneLocation] =
    useState<PhoneLocation | null>(null)
  const [justLoggedIn, setJustLoggedIn] = useState(false)

  const startSiteVerification = useCallback(
    async (email: string, role: UserRole, projectId: string) => {
      const site = sitePinForProject(projectId || siteInfo.projectId)
      const challenge = await createChallenge({
        email: email.trim(),
        projectId: site.projectId,
        site,
      })
      const pending: PendingLogin = {
        email: email.trim(),
        role,
        projectId: site.projectId,
        challengeId: challenge.id,
        site,
        expiresAt: challenge.expiresAt,
      }
      setPendingLogin(pending)
      setUser(null)
      setJustLoggedIn(false)
      return pending
    },
    [],
  )

  const completeSiteVerification = useCallback(
    async (code: string) => {
      if (!pendingLogin) throw new Error('No pending login to verify')
      const result = await confirmChallengeCode(pendingLogin.challengeId, code)
      setLastPhoneLocation(result.phoneLocation)
      setUser({
        id: 'u-session',
        name: pendingLogin.role === 'safety_officer' ? 'Admin' : 'Site Engineer',
        email: pendingLogin.email,
        role: pendingLogin.role,
      })
      setPendingLogin(null)
      setJustLoggedIn(true)
    },
    [pendingLogin],
  )

  const clearPendingLogin = useCallback(() => {
    setPendingLogin(null)
  }, [])

  /** Signup / demo shortcut — skips phone GPS for now */
  const login = useCallback((email: string, role: UserRole) => {
    setUser({
      id: 'u-session',
      name: role === 'safety_officer' ? 'Admin' : 'Site Engineer',
      email,
      role,
    })
    setPendingLogin(null)
    setJustLoggedIn(true)
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setPendingLogin(null)
    setLastPhoneLocation(null)
    setJustLoggedIn(false)
  }, [])

  const consumeJustLoggedIn = useCallback(() => {
    setJustLoggedIn(false)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      pendingLogin,
      lastPhoneLocation,
      justLoggedIn,
      startSiteVerification,
      completeSiteVerification,
      clearPendingLogin,
      login,
      logout,
      consumeJustLoggedIn,
    }),
    [
      user,
      pendingLogin,
      lastPhoneLocation,
      justLoggedIn,
      startSiteVerification,
      completeSiteVerification,
      clearPendingLogin,
      login,
      logout,
      consumeJustLoggedIn,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
