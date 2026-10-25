import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { SiteProvider } from '@/context/SiteContext'
import { AppErrorBoundary } from '@/components/AppErrorBoundary'

const AppLayout = lazy(() =>
  import('@/components/layout/AppLayout').then((m) => ({ default: m.AppLayout })),
)

const LoginPage = lazy(() =>
  import('@/pages/login/LoginPage').then((m) => ({ default: m.LoginPage })),
)
const LoginVerifyPage = lazy(() =>
  import('@/pages/login/LoginVerifyPage').then((m) => ({
    default: m.LoginVerifyPage,
  })),
)
const PhoneVerifyPage = lazy(() =>
  import('@/pages/verify/PhoneVerifyPage').then((m) => ({
    default: m.PhoneVerifyPage,
  })),
)
const SignUpPage = lazy(() =>
  import('@/pages/signup/SignUpPage').then((m) => ({ default: m.SignUpPage })),
)
const LiveFeedPage = lazy(() =>
  import('@/pages/live-feed/LiveFeedPage').then((m) => ({
    default: m.LiveFeedPage,
  })),
)
const RecordsPage = lazy(() =>
  import('@/pages/records/RecordsPage').then((m) => ({ default: m.RecordsPage })),
)
const ToolboxSessionPage = lazy(() =>
  import('@/pages/records/ToolboxSessionPage').then((m) => ({
    default: m.ToolboxSessionPage,
  })),
)
const SnapshotPage = lazy(() =>
  import('@/pages/snapshot/SnapshotPage').then((m) => ({
    default: m.SnapshotPage,
  })),
)
const ToolboxPage = lazy(() =>
  import('@/pages/toolbox/ToolboxPage').then((m) => ({ default: m.ToolboxPage })),
)
const AboutPage = lazy(() =>
  import('@/pages/about/AboutPage').then((m) => ({ default: m.AboutPage })),
)

function RouteFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f4f5f7]">
      <div
        className="h-8 w-8 animate-spin rounded-full border-2 border-[#ff6a1a] border-t-transparent"
        role="status"
        aria-label="Loading"
      />
    </div>
  )
}

export default function App() {
  return (
    <AppErrorBoundary>
      <AuthProvider>
        <SiteProvider>
          <BrowserRouter>
            <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/login/verify" element={<LoginVerifyPage />} />
              <Route path="/verify/:challengeId" element={<PhoneVerifyPage />} />
              <Route path="/signup" element={<SignUpPage />} />
              <Route element={<AppLayout />}>
                <Route index element={<LiveFeedPage />} />
                <Route path="live" element={<Navigate to="/" replace />} />
                <Route path="toolbox" element={<ToolboxPage />} />
                <Route path="records" element={<RecordsPage />} />
                <Route
                  path="records/:sessionId"
                  element={<ToolboxSessionPage />}
                />
                <Route path="snapshots/:snapshotId" element={<SnapshotPage />} />
                <Route path="about" element={<AboutPage />} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            </Suspense>
          </BrowserRouter>
        </SiteProvider>
      </AuthProvider>
    </AppErrorBoundary>
  )
}
