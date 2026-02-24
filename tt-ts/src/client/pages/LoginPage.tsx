import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { auth } from '../api'

export function LoginPage() {
  const { login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(username, password)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <Link to="/" className="block text-center text-sm mb-4" style={{ color: 'var(--tt-text-muted)' }}>
        ← Back to home
      </Link>
      <img src="/tythe-logo.png" alt="Tythe Barn" width={200} style={{ display: 'block', margin: '0 auto 1rem' }} />
      <div className="login-hero">
        <p className="login-eyebrow">Secure Access</p>
        <h1 className="login-title">Employee Portal — The Tythe Barn</h1>
        <p className="login-subtitle">Employee and manager timekeeping for daily operations.</p>
      </div>
      <form onSubmit={handleLogin} className="login-form">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />
        {error && <p className="message-error">{error}</p>}
        <button type="submit" disabled={loading}>
          Log In
        </button>
      </form>
    </div>
  )
}

export function FirstSetupPage() {
  const { login } = useAuth()
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    try {
      await auth.createFirstAdmin(username, password, displayName)
      await login(username, password)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Setup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <img src="/tythe-logo.png" alt="Tythe Barn" width={200} style={{ display: 'block', margin: '0 auto 1rem' }} />
      <div className="login-hero">
        <p className="login-eyebrow">First-Time Setup</p>
        <h1 className="login-title">Create Your Admin Account</h1>
        <p className="login-subtitle">No accounts exist yet. Create the first manager account to get started.</p>
      </div>
      <form onSubmit={handleSubmit} className="login-form">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Display name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Confirm password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
        />
        {error && <p className="message-error">{error}</p>}
        <button type="submit" disabled={loading}>
          Create admin account
        </button>
      </form>
    </div>
  )
}
