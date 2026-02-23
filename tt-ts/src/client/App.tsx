import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'

import { LoginPage, FirstSetupPage } from './pages/LoginPage'
import { Layout } from './pages/Layout'
import { ClockPage } from './pages/ClockPage'
import { TimesheetPage } from './pages/TimesheetPage'
import { ExportPage } from './pages/ExportPage'
import { ManagerPage } from './pages/ManagerPage'

function AppRoutes() {
  const { user, loading } = useAuth()
  const [needsSetup, setNeedsSetup] = React.useState<boolean | null>(null)

  React.useEffect(() => {
    if (loading) return
    if (user) return
    fetch('/api/auth/first-setup', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => setNeedsSetup(d.needsSetup))
      .catch(() => setNeedsSetup(false))
  }, [user, loading])

  if (loading) return <div className="loading">Loading...</div>
  if (user) {
    return (
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/clock" replace />} />
          <Route path="clock" element={<ClockPage />} />
          <Route path="timesheet" element={<TimesheetPage />} />
          <Route path="export" element={<ExportPage />} />
          <Route path="manager" element={<ManagerPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    )
  }
  if (needsSetup) return <FirstSetupPage />
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
