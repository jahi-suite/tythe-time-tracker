import React, { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { auth } from '../api'
import { Container, Footer } from '../components'

export function Layout() {
  const { user, logout } = useAuth()
  const venueName = user?.venue?.name ?? 'The Tythe Barn'
  const isTytheVenue = (user?.venue?.slug || '').trim().toLowerCase() === 'tythe'
  const navigate = useNavigate()
  const location = useLocation()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const displayName = (user?.display_name?.trim() || user?.username?.trim() || 'User').trim() || 'User'

  const isManager = user?.role === 'manager' || user?.role === 'admin'
  const isAdmin = user?.role === 'admin'
  const pages = [
    { path: '/clock', label: 'Clock' },
    { path: '/timesheet', label: 'Timesheet' },
    { path: '/export', label: 'Exports' },
    ...(isManager ? [{ path: '/manager', label: 'Manager' }] : []),
    ...(isAdmin ? [{ path: '/venue-settings', label: 'Venue' }] : []),
  ]

  const handleLogout = async () => {
    await logout()
    // Delay so browser processes Set-Cookie from logout response before we navigate (deploy trigger)
    await new Promise((r) => setTimeout(r, 150))
    window.location.href = '/venues'
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError('')
    setPasswordSuccess('')
    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match')
      return
    }
    try {
      await auth.changePassword(currentPassword, newPassword)
      setPasswordSuccess('Password changed successfully')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Failed to change password')
    }
  }

  return (
    <div className="app-shell">
      <Container className="app-shell__content">
        <section className="app-shell__intro" aria-label="Workspace details">
          <div className="app-shell__intro-main">
            <div className="app-shell__brand-row">
              <img
                src={isTytheVenue ? '/tythe-logo.png' : '/kari-logo.png'}
                alt={isTytheVenue ? 'Tythe Barn' : 'Kari Suite'}
                className="app-shell__venue-logo"
                width={44}
                height={44}
              />
              <div>
                <p className="app-shell__kicker">{venueName}</p>
                <h1 className="app-shell__title">Kari Time</h1>
              </div>
            </div>
            <p className="app-shell__subtle">
              <strong>{displayName}</strong> ({user?.role})
            </p>
          </div>
          <div className="app-shell__actions">
            <button onClick={handleLogout} className="btn-secondary" type="button">
              Logout
            </button>
          </div>
        </section>

        <div className="app-shell__nav" role="navigation" aria-label="Workspace sections">
          {pages.map((p) => {
            const isActive = location.pathname === p.path
            return (
              <button
                key={p.path}
                type="button"
                className={`app-shell__nav-link${isActive ? ' active' : ''}`}
                aria-current={isActive ? 'page' : undefined}
                onClick={() => navigate(p.path)}
              >
                {p.label}
              </button>
            )
          })}
        </div>

        <div className="app-shell__support-grid">
          <details className="app-shell__panel">
            <summary>Password</summary>
            <form onSubmit={handleChangePassword} className="app-shell__password-form">
              <input
                type="password"
                placeholder="Current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
              <input
                type="password"
                placeholder="New password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              {passwordError && <p className="message-error">{passwordError}</p>}
              {passwordSuccess && <p className="message-success">{passwordSuccess}</p>}
              <button type="submit">Change password</button>
            </form>
          </details>

          <details className="app-shell__panel pay-rate-info">
            <summary>Pay rates</summary>
            <p>
              <strong>Rules:</strong> Standard (4AM-7PM), Enhanced (7PM-4AM), Supervisor (when selected).
            </p>
          </details>
        </div>

        <main className="app-shell__main">
          <Outlet />
        </main>
      </Container>

      <Footer className="app-shell__footer" />
    </div>
  )
}
