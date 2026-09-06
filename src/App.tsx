import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { AppLayout } from '@/components/layout/AppLayout'
import { LoginPage } from '@/pages/LoginPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { RecordsPage } from '@/pages/RecordsPage'
import { WorkersPage } from '@/pages/WorkersPage'
import { WorkerDetailPage } from '@/pages/WorkerDetailPage'
import { ToolboxCreatePage } from '@/pages/ToolboxCreatePage'
import { WorkSessionsPage } from '@/pages/WorkSessionsPage'
import { WorkSessionDetailPage } from '@/pages/WorkSessionDetailPage'
import { ViolationsPage } from '@/pages/ViolationsPage'
import { EvidencePage } from '@/pages/EvidencePage'
import { ReportsPage } from '@/pages/ReportsPage'
import { SettingsPage } from '@/pages/SettingsPage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<AppLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="records" element={<RecordsPage />} />
            <Route path="workers" element={<WorkersPage />} />
            <Route path="workers/:workerId" element={<WorkerDetailPage />} />
            <Route path="toolbox/create" element={<ToolboxCreatePage />} />
            <Route path="work-sessions" element={<WorkSessionsPage />} />
            <Route
              path="work-sessions/:sessionId"
              element={<WorkSessionDetailPage />}
            />
            <Route path="violations" element={<ViolationsPage />} />
            <Route path="evidence" element={<EvidencePage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
