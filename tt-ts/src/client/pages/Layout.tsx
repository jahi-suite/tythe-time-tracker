import React, { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { auth } from '../api'

export function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const displayName = user?.display_name || user?.username || 'Unknown user'

  const isManager = user?.role === 'manager' || user?.role === 'admin'
  const pages = [
    { path: '/clock', label: 'Employee Clock In/Out' },
    { path: '/timesheet', label: 'Personal Timesheet' },
    { path: '/export', label: 'Export Timesheet' },
    ...(isManager ? [{ path: '/manager', label: 'Manager Dashboard' }] : []),
  ]

  const handleLogout = async () => {
    await logout()
    navigate('/login')
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
    <div className="app-layout">
      <header className="app-header">
        <div className="app-header-brand">
          <img
            src="/tythe-logo.png"
            alt="Tythe Barn"
            className="app-header-logo"
            width={48}
            height={48}
          />
          <div>
            <p className="app-header-kicker">Tythe Barn</p>
            <h1>Employee Portal — The Tythe Barn</h1>
          </div>
        </div>
      </header>
      <nav className="sidebar">
        <p className="user-info">
          <strong>Logged in as:</strong> {displayName} ({user?.role})
        </p>
        <button onClick={handleLogout} className="btn-secondary">
          Logout
        </button>
        <hr />
        <details>
          <summary>Change my password</summary>
          <form onSubmit={handleChangePassword}>
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
        <hr />
        <details className="pay-rate-info">
          <summary>Pay Rate Information</summary>
          <p>
            <strong>Pay Rate Rules:</strong> Standard (4AM–7PM), Enhanced (7PM–4AM), Supervisor (when selected).
          </p>
        </details>
        <hr />
        <div className="sidebar-nav-section">
          <p className="sidebar-nav-label">Navigation</p>
          <div className="sidebar-nav-list" role="navigation" aria-label="Primary">
            {pages.map((p) => {
              const isActive = location.pathname === p.path
              return (
                <button
                  key={p.path}
                  type="button"
                  className={`sidebar-nav-link${isActive ? ' active' : ''}`}
                  aria-current={isActive ? 'page' : undefined}
                  onClick={() => navigate(p.path)}
                >
                  {p.label}
                </button>
              )
            })}
          </div>
        </div>
      </nav>
      <main>
        <Outlet />
      </main>
      <footer className="footer">
        <hr />
        <div className="footer-brand">
          <img src="/kari-logo.png" alt="Kari" width={14} height={14} className="footer-brand-logo" />
          <span>Powered by Kari Suite</span>
        </div>
        <p className="footer-note">Mobile: Safari 14+ or Chrome. Legacy build for older Safari.</p>
      </footer>
    </div>
  )
}
