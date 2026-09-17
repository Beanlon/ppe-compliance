import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { AppLayout } from '@/components/layout/AppLayout'
import { LoginPage } from '@/pages/login/LoginPage'
import { SignUpPage } from '@/pages/signup/SignUpPage'
import { LiveFeedPage } from '@/pages/live-feed/LiveFeedPage'
import { RecordsPage } from '@/pages/records/RecordsPage'
import { SnapshotPage } from '@/pages/snapshot/SnapshotPage'
import { AboutPage } from '@/pages/about/AboutPage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route element={<AppLayout />}>
            <Route index element={<LiveFeedPage />} />
            <Route path="live" element={<Navigate to="/" replace />} />
            <Route path="records" element={<RecordsPage />} />
            <Route path="snapshots/:snapshotId" element={<SnapshotPage />} />
            <Route path="about" element={<AboutPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
