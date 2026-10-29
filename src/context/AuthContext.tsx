import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type Context,
  type ReactNode,
} from 'react'
import type { User } from '@/types'
import { siteInfo } from '@/data/mock'
import {
  confirmChallengeCode,
  createChallenge,
  type PhoneLocation,
  type SitePin,
} from '@/lib/verifyApi'
import { isSupabaseConfigured, supabase } from '@/lib/supabaseClient'
import {
  createProject,
  displayName,
  fetchProfile,
  fetchProjectByCode,
} from '@/lib/supabaseApi'

export type PendingLogin = {
  email: string
  projectId: string
  challengeId: string
  site: SitePin
  expiresAt: number
  /** Set after Supabase password check; finishes app unlock after GPS. */
  authUserId: string
  firstName: string
  lastName: string
}

export type SignUpInput = {
  firstName: string
  lastName: string
  email: string
  password: string
  projectName: string
  projectCode: string
  address: string
  lat: number
  lng: number
}

interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  authReady: boolean
  pendingLogin: PendingLogin | null
  lastPhoneLocation: PhoneLocation | null
  justLoggedIn: boolean
  startSiteVerification: (
    email: string,
    password: string,
    projectId: string,
  ) => Promise<PendingLogin>
  completeSiteVerification: (code: string) => Promise<void>
  clearPendingLogin: () => void
  /** Local-only unlock (dev / SKIP_SITE_VERIFICATION). Prefer signUp / startSiteVerification. */
  login: (email: string) => void
  signUp: (input: SignUpInput) => Promise<void>
  logout: () => Promise<void>
  consumeJustLoggedIn: () => void
}

/**
 * Temporary bypass of the phone GPS / QR site check on login.
 * Set to false to require on-site location verification again.
 */
export const SKIP_SITE_VERIFICATION = false

const AUTH_CONTEXT_KEY = '__gearsightAuthContext'
const globalStore = globalThis as unknown as Record<
  string,
  Context<AuthContextValue | null> | undefined
>
const AuthContext =
  globalStore[AUTH_CONTEXT_KEY] ?? createContext<AuthContextValue | null>(null)
globalStore[AUTH_CONTEXT_KEY] = AuthContext

function toUser(
  id: string,
  firstName: string,
  lastName: string,
  email: string,
): User {
  return {
    id,
    firstName,
    lastName,
    name: displayName(firstName, lastName),
    email,
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [pendingLogin, setPendingLogin] = useState<PendingLogin | null>(null)
  const [lastPhoneLocation, setLastPhoneLocation] =
    useState<PhoneLocation | null>(null)
  const [justLoggedIn, setJustLoggedIn] = useState(false)
  const [authReady, setAuthReady] = useState(!isSupabaseConfigured)
  const pendingRef = useRef<PendingLogin | null>(null)
  pendingRef.current = pendingLogin

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setAuthReady(true)
      return
    }

    let cancelled = false

    async function hydrateFromSession() {
      const { data } = await supabase.auth.getSession()
      const session = data.session
      if (!session || cancelled) {
        if (!cancelled) setAuthReady(true)
        return
      }
      // Mid GPS verify: keep Supabase session but do not unlock the app yet.
      if (pendingRef.current) {
        if (!cancelled) setAuthReady(true)
        return
      }
      try {
        const profile = await fetchProfile(session.user.id)
        if (cancelled) return
        setUser(
          toUser(
            session.user.id,
            profile?.first_name ?? '',
            profile?.last_name ?? '',
            profile?.email ?? session.user.email ?? '',
          ),
        )
      } catch {
        if (!cancelled) setUser(null)
      } finally {
        if (!cancelled) setAuthReady(true)
      }
    }

    void hydrateFromSession()

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setUser(null)
        return
      }
      if (pendingRef.current) return
      void fetchProfile(session.user.id)
        .then((profile) => {
          if (pendingRef.current) return
          setUser(
            toUser(
              session.user.id,
              profile?.first_name ?? '',
              profile?.last_name ?? '',
              profile?.email ?? session.user.email ?? '',
            ),
          )
        })
        .catch(() => {
          /* keep prior user if profile lag */
        })
    })

    return () => {
      cancelled = true
      sub.subscription.unsubscribe()
    }
  }, [])

  const startSiteVerification = useCallback(
    async (email: string, password: string, projectId: string) => {
      if (!isSupabaseConfigured) {
        throw new Error(
          'Supabase is not configured. Add keys to .env.local (see .env.example).',
        )
      }

      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        })
      if (authError) throw authError
      if (!authData.user) throw new Error('Sign-in failed')

      const profile = await fetchProfile(authData.user.id)
      const project = await fetchProjectByCode(projectId)
      if (!project) {
        await supabase.auth.signOut()
        throw new Error('No project found for that Project ID on this account.')
      }
      if (project.created_by !== authData.user.id) {
        await supabase.auth.signOut()
        throw new Error('That Project ID does not belong to this account.')
      }

      const site: SitePin = {
        name: project.name,
        address: project.address,
        projectId: project.project_code,
        lat: project.lat,
        lng: project.lng,
      }

      const pendingBase = {
        email: email.trim(),
        projectId: project.project_code,
        site,
        authUserId: authData.user.id,
        firstName: profile?.first_name ?? '',
        lastName: profile?.last_name ?? '',
      }

      if (SKIP_SITE_VERIFICATION) {
        setUser(
          toUser(
            authData.user.id,
            pendingBase.firstName,
            pendingBase.lastName,
            pendingBase.email,
          ),
        )
        setPendingLogin(null)
        setJustLoggedIn(true)
        return {
          ...pendingBase,
          challengeId: 'skipped',
          expiresAt: Date.now() + 600_000,
        } satisfies PendingLogin
      }

      // Keep the Supabase session; only the app `user` waits on GPS verify.
      const challenge = await createChallenge({
        email: email.trim(),
        projectId: project.project_code,
        site,
      })
      const pending: PendingLogin = {
        ...pendingBase,
        challengeId: challenge.id,
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
      setUser(
        toUser(
          pendingLogin.authUserId,
          pendingLogin.firstName,
          pendingLogin.lastName,
          pendingLogin.email,
        ),
      )
      setPendingLogin(null)
      setJustLoggedIn(true)
    },
    [pendingLogin],
  )

  const clearPendingLogin = useCallback(() => {
    setPendingLogin(null)
  }, [])

  const login = useCallback((email: string) => {
    setUser(toUser('local-dev', 'Admin', '', email))
    setPendingLogin(null)
    setJustLoggedIn(true)
  }, [])

  const signUp = useCallback(async (input: SignUpInput) => {
    if (!isSupabaseConfigured) {
      throw new Error(
        'Supabase is not configured. Add keys to .env.local (see .env.example).',
      )
    }
    const firstName = input.firstName.trim()
    const lastName = input.lastName.trim()
    const email = input.email.trim()
    if (!firstName || !lastName) {
      throw new Error('Enter first and last name')
    }
    if (!input.password || input.password.length < 8) {
      throw new Error('Password must be at least 8 characters')
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password: input.password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
        },
      },
    })
    if (error) throw error
    if (!data.user) throw new Error('Sign-up failed')

    // Email confirm may leave session null — require active session for insert.
    if (!data.session) {
      const again = await supabase.auth.signInWithPassword({
        email,
        password: input.password,
      })
      if (again.error) {
        throw new Error(
          again.error.message ||
            'Account created. Confirm your email (or disable email confirm in Supabase), then sign in.',
        )
      }
    }

    await createProject({
      projectCode: input.projectCode.trim(),
      name: input.projectName.trim() || siteInfo.name,
      address: input.address.trim(),
      lat: input.lat,
      lng: input.lng,
      createdBy: data.user.id,
    })

    // Account + project are ready — sign out so the user can test login.
    await supabase.auth.signOut()
    setUser(null)
    setPendingLogin(null)
    setJustLoggedIn(false)
  }, [])

  const logout = useCallback(async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut()
    }
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
      authReady,
      pendingLogin,
      lastPhoneLocation,
      justLoggedIn,
      startSiteVerification,
      completeSiteVerification,
      clearPendingLogin,
      login,
      signUp,
      logout,
      consumeJustLoggedIn,
    }),
    [
      user,
      authReady,
      pendingLogin,
      lastPhoneLocation,
      justLoggedIn,
      startSiteVerification,
      completeSiteVerification,
      clearPendingLogin,
      login,
      signUp,
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
