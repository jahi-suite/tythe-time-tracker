import React, { useState, useEffect } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { auth, venues } from '../api'

export function LoginPage() {
  const { login } = useAuth()
  const { venueSlug } = useParams()
  const [searchParams] = useSearchParams()
  const isVerified = searchParams.get('verified') === 'true'
  const effectiveVenueSlug = (venueSlug || 'tythe').trim() || 'tythe'
  const isTytheVenue = effectiveVenueSlug.toLowerCase() === 'tythe'
  const [venueName, setVenueName] = useState<string | null>(null)
  const [username, setUsername] = useState('')
  useEffect(() => {
    venues.getBySlug(effectiveVenueSlug).then((v) => setVenueName(v.name)).catch(() => setVenueName(effectiveVenueSlug))
  }, [effectiveVenueSlug])
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(username, password, effectiveVenueSlug)
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
      <img
        src={isTytheVenue ? '/tythe-logo.png' : '/kari-logo.png'}
        alt={isTytheVenue ? 'Tythe Barn' : 'Kari Suite'}
        width={200}
        style={{ display: 'block', margin: '0 auto 1rem' }}
      />
      <div className="login-hero">
        <p className="login-eyebrow">Kari Time</p>
        <h1 className="login-title">Sign in — {venueName ?? effectiveVenueSlug}</h1>
        <p className="login-subtitle">Clock in. Check timesheets. Export when needed.</p>
      </div>
      {isVerified && (
        <p className="message-success" style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
          Email verified successfully! You can now log in.
        </p>
      )}
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
  const { venueSlug } = useParams()
  const effectiveVenueSlug = (venueSlug || 'tythe').trim() || 'tythe'
  const isTytheVenue = effectiveVenueSlug.toLowerCase() === 'tythe'
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
      await auth.createFirstAdmin(username, password, displayName, effectiveVenueSlug)
      await login(username, password, effectiveVenueSlug)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Setup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <img
        src={isTytheVenue ? '/tythe-logo.png' : '/kari-logo.png'}
        alt={isTytheVenue ? 'Tythe Barn' : 'Kari Suite'}
        width={200}
        style={{ display: 'block', margin: '0 auto 1rem' }}
      />
      <div className="login-hero">
        <p className="login-eyebrow">First setup</p>
        <h1 className="login-title">Create admin account</h1>
        <p className="login-subtitle">No accounts yet. Create the first manager account.</p>
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
          Create account
        </button>
      </form>
    </div>
  )
}
