import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'

import { MarketingLandingPage } from './pages/MarketingLandingPage'
import { VenueLandingPage } from './pages/VenueLandingPage'
import { LoginPage, FirstSetupPage } from './pages/LoginPage'
import { Layout } from './pages/Layout'
import { ClockPage } from './pages/ClockPage'
import { TimesheetPage } from './pages/TimesheetPage'
import { ExportPage } from './pages/ExportPage'
import { ManagerPage } from './pages/ManagerPage'
import { TermsPage } from './pages/TermsPage'
import { PrivacyPage } from './pages/PrivacyPage'

function AppRoutes() {
  const { user, loading } = useAuth()
  const [needsSetup, setNeedsSetup] = React.useState<boolean | null>(null)
  const [apiReachable, setApiReachable] = React.useState<boolean | null>(null)
  const venueSlug =
    (typeof window !== 'undefined'
      ? window.location.pathname.match(/^\/([^/]+)\/login\/?$/)?.[1]
      : null) ?? 'tythe'

  React.useEffect(() => {
    if (loading) return
    if (user) return
    fetch(`/api/auth/first-setup?venue_slug=${encodeURIComponent(venueSlug)}`, { credentials: 'include' })
      .then((r) => {
        setApiReachable(true)
        return r.json()
      })
      .then((d) => setNeedsSetup(d.needsSetup))
      .catch(() => {
        setApiReachable(false)
        setNeedsSetup(false)
      })
  }, [user, loading])

  if (loading) return <div className="loading">Loading...</div>
  if (apiReachable === false) {
    return (
      <div className="connection-error">
        <h2>Cannot connect to API</h2>
        <p>Make sure the server is running. In a terminal:</p>
        <pre>cd tt-ts && npm run dev</pre>
        <p>Then open <a href="http://localhost:5173">http://localhost:5173</a></p>
      </div>
    )
  }
  if (user) {
    return (
      <Routes>
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
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
  if (needsSetup)
    return (
      <Routes>
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/login" element={<FirstSetupPage />} />
        <Route path="/:venueSlug/login" element={<FirstSetupPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  return (
    <Routes>
      <Route path="/" element={<MarketingLandingPage />} />
      <Route path="/venues" element={<VenueLandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/:venueSlug/login" element={<LoginPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
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
