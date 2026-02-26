import React, { useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { venues, auth } from '../api'

const SEARCH_DEBOUNCE_MS = 300

export function VenueLandingPage() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<{ slug: string; name: string }[]>([])
  const [searching, setSearching] = useState(false)
  const [createMode, setCreateMode] = useState(false)
  const [createVenueName, setCreateVenueName] = useState('')
  const [createAdminEmail, setCreateAdminEmail] = useState('')
  const [createUsername, setCreateUsername] = useState('')
  const [createDisplayName, setCreateDisplayName] = useState('')
  const [createPassword, setCreatePassword] = useState('')
  const [createError, setCreateError] = useState('')
  const [createLoading, setCreateLoading] = useState(false)

  const runSearch = useCallback(async (q: string) => {
    const trimmed = q.trim()
    if (!trimmed) {
      setSearchResults([])
      return
    }
    setSearching(true)
    try {
      const results = await venues.search(trimmed)
      setSearchResults(results)
    } catch {
      setSearchResults([])
    } finally {
      setSearching(false)
    }
  }, [])

  React.useEffect(() => {
    const t = setTimeout(() => runSearch(searchQuery), SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(t)
  }, [searchQuery, runSearch])

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreateError('')
    if (!createVenueName.trim() || !createAdminEmail.trim() || !createUsername.trim() || !createDisplayName.trim() || !createPassword) {
      setCreateError('All fields are required')
      return
    }
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRe.test(createAdminEmail.trim())) {
      setCreateError('Please enter a valid email address')
      return
    }
    if (createPassword.length < 6) {
      setCreateError('Password must be at least 6 characters')
      return
    }
    setCreateLoading(true)
    try {
      const res = await venues.create({
        venueName: createVenueName.trim(),
        adminEmail: createAdminEmail.trim(),
        adminUsername: createUsername.trim(),
        adminDisplayName: createDisplayName.trim(),
        adminPassword: createPassword,
      })
      // Auto-login after creation
      try {
        await auth.login(createUsername.trim(), createPassword, res.venue.slug)
        navigate(`/${res.venue.slug}/clock`)
      } catch (loginErr) {
        console.warn('Auto-login failed after signup:', loginErr)
        window.location.href = res.redirectUrl
      }
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Failed to create venue')
    } finally {
      setCreateLoading(false)
    }
  }

  return (
    <div className="venue-landing">
      <div className="venue-landing-inner">
        <h1 className="venue-landing-title">Kari Time</h1>
        <p className="venue-landing-subtitle">Payroll-ready shift tracking for hospitality venues</p>

        {!createMode ? (
          <>
            <div className="venue-search-section">
              <label htmlFor="venue-search">Find your venue</label>
              <input
                id="venue-search"
                type="text"
                placeholder="Type venue name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoComplete="off"
              />
              {searching && <p className="venue-search-hint">Searching...</p>}
              {searchResults.length > 0 && (
                <ul className="venue-search-results">
                  {searchResults.map((v) => (
                    <li key={v.slug}>
                      <Link to={`/${v.slug}/login`}>{v.name}</Link>
                    </li>
                  ))}
                </ul>
              )}
              {!searching && searchQuery.trim() && searchResults.length === 0 && (
                <p className="venue-search-hint">No venues found. Create one below.</p>
              )}
            </div>

            <p className="venue-landing-divider">or</p>

            <button
              type="button"
              className="venue-create-toggle"
              onClick={() => setCreateMode(true)}
            >
              Create new venue
            </button>
          </>
        ) : (
          <div className="venue-create-section">
            <h2>Create new venue</h2>
            <form onSubmit={handleCreateSubmit}>
              <input
                type="text"
                placeholder="Venue name"
                value={createVenueName}
                onChange={(e) => setCreateVenueName(e.target.value)}
                required
              />
              <input
                type="email"
                placeholder="Admin email"
                value={createAdminEmail}
                onChange={(e) => setCreateAdminEmail(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Admin username"
                value={createUsername}
                onChange={(e) => setCreateUsername(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Admin display name"
                value={createDisplayName}
                onChange={(e) => setCreateDisplayName(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Admin password (min 6 characters)"
                value={createPassword}
                onChange={(e) => setCreatePassword(e.target.value)}
                required
              />
              {createError && <p className="message-error">{createError}</p>}
              <div className="venue-create-actions">
                <button type="submit" disabled={createLoading}>
                  {createLoading ? 'Creating...' : 'Create venue'}
                </button>
                <button
                  type="button"
                  className="venue-create-cancel"
                  onClick={() => {
                    setCreateMode(false)
                    setCreateError('')
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <p className="venue-landing-footer">
          <Link to="/">← Back to home</Link>
        </p>
      </div>

      <style>{`
        .venue-landing {
          --venue-night: #0d0b09;
          --venue-night-soft: #17120e;
          --venue-cream: #f6efdf;
          --venue-cream-muted: rgba(246, 239, 223, 0.74);
          --venue-amber: #d49a3d;
          --venue-amber-strong: #e0ab55;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: clamp(1rem, 4vw, 2rem);
          color: var(--venue-cream);
          font-family: var(--font-family-sans);
          background:
            radial-gradient(circle at 8% 8%, rgba(212, 154, 61, 0.16), transparent 45%),
            radial-gradient(circle at 92% 92%, rgba(224, 171, 85, 0.1), transparent 46%),
            var(--venue-night);
        }
        .venue-landing-inner {
          max-width: 460px;
          width: 100%;
          padding: 1.1rem;
          border-radius: 18px;
          border: 1px solid rgba(212, 154, 61, 0.18);
          background:
            linear-gradient(180deg, rgba(25, 19, 14, 0.96), rgba(17, 13, 10, 0.98));
          box-shadow: 0 18px 52px rgba(7, 6, 5, 0.42);
          position: relative;
          overflow: hidden;
        }
        .venue-landing-inner::before {
          content: "";
          position: absolute;
          inset: 0 auto auto 0;
          width: 60%;
          height: 48%;
          background: radial-gradient(circle, rgba(212, 154, 61, 0.08) 0%, transparent 72%);
          pointer-events: none;
        }
        .venue-landing-inner > * {
          position: relative;
          z-index: 1;
        }
        .venue-landing-title {
          font-family: var(--font-family-display);
          font-size: clamp(1.7rem, 3.4vw, 2rem);
          font-weight: 700;
          margin-bottom: 0.25rem;
          color: var(--venue-cream);
          letter-spacing: -0.02em;
        }
        .venue-landing-subtitle {
          font-size: 0.95rem;
          color: var(--venue-cream-muted);
          margin: 0 0 1.25rem;
          line-height: 1.45;
          padding-bottom: 1rem;
          border-bottom: 1px solid rgba(212, 154, 61, 0.12);
        }
        .venue-search-section label,
        .venue-create-section h2 {
          display: block;
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          margin-bottom: 0.55rem;
          color: var(--venue-amber-strong);
        }
        .venue-create-section h2 {
          font-family: var(--font-family-display);
          font-size: 1.35rem;
          text-transform: none;
          letter-spacing: -0.02em;
          margin-bottom: 0.95rem;
          color: var(--venue-cream);
        }
        .venue-search-section input,
        .venue-create-section input {
          width: 100%;
          min-height: 2.85rem;
          padding: 0.7rem 0.85rem;
          border: 1px solid rgba(212, 154, 61, 0.18);
          border-radius: 10px;
          font-size: 1rem;
          margin-bottom: 0.5rem;
          background: rgba(246, 239, 223, 0.04);
          color: var(--venue-cream);
          outline: none;
          transition: border-color 120ms ease, box-shadow 120ms ease, background 120ms ease;
        }
        .venue-search-section input::placeholder,
        .venue-create-section input::placeholder {
          color: rgba(246, 239, 223, 0.42);
        }
        .venue-search-section input:focus,
        .venue-create-section input:focus {
          border-color: rgba(224, 171, 85, 0.44);
          box-shadow: 0 0 0 3px rgba(212, 154, 61, 0.08);
          background: rgba(246, 239, 223, 0.06);
        }
        .venue-search-hint {
          font-size: 0.8rem;
          color: var(--venue-cream-muted);
          margin-bottom: 0.5rem;
        }
        .venue-search-results {
          list-style: none;
          margin: 0;
          padding: 0;
          border: 1px solid rgba(212, 154, 61, 0.16);
          border-radius: 12px;
          background: rgba(246, 239, 223, 0.03);
          margin-top: 0.5rem;
          overflow: hidden;
        }
        .venue-search-results li a {
          display: block;
          padding: 0.7rem 0.85rem;
          color: var(--venue-cream);
          text-decoration: none;
          border-top: 1px solid rgba(212, 154, 61, 0.08);
        }
        .venue-search-results li:first-child a {
          border-top: none;
        }
        .venue-search-results li a:hover {
          background: rgba(212, 154, 61, 0.08);
        }
        .venue-search-results li a:focus-visible {
          outline: 2px solid rgba(224, 171, 85, 0.35);
          outline-offset: -2px;
        }
        .venue-landing-divider {
          text-align: center;
          margin: 1.15rem 0;
          color: var(--venue-cream-muted);
          font-size: 0.875rem;
          position: relative;
          text-transform: uppercase;
          letter-spacing: 0.12em;
        }
        .venue-landing-divider::before,
        .venue-landing-divider::after {
          content: "";
          position: absolute;
          top: 50%;
          width: calc(50% - 1.4rem);
          border-top: 1px solid rgba(212, 154, 61, 0.12);
        }
        .venue-landing-divider::before {
          left: 0;
        }
        .venue-landing-divider::after {
          right: 0;
        }
        .venue-create-toggle {
          width: 100%;
          min-height: 2.85rem;
          padding: 0.7rem 1rem;
          background: linear-gradient(180deg, var(--venue-amber-strong), var(--venue-amber));
          color: #1a1209;
          border: 1px solid rgba(212, 154, 61, 0.65);
          border-radius: 10px;
          font-size: 1rem;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 8px 18px rgba(212, 154, 61, 0.18);
        }
        .venue-create-toggle:hover,
        .venue-create-actions button:first-child:hover {
          filter: brightness(1.03);
        }
        .venue-create-toggle:focus-visible,
        .venue-create-actions button:first-child:focus-visible,
        .venue-create-cancel:focus-visible,
        .venue-landing-footer a:focus-visible {
          outline: 2px solid rgba(224, 171, 85, 0.35);
          outline-offset: 2px;
        }
        .venue-create-section {
          padding: 0.95rem;
          border-radius: 14px;
          border: 1px solid rgba(212, 154, 61, 0.14);
          background: rgba(12, 10, 8, 0.48);
        }
        .venue-create-actions {
          display: flex;
          gap: 0.5rem;
          margin-top: 0.75rem;
        }
        .venue-create-actions button:first-child {
          flex: 1;
          min-height: 2.75rem;
          padding: 0.65rem 1rem;
          background: linear-gradient(180deg, var(--venue-amber-strong), var(--venue-amber));
          color: #1a1209;
          border: 1px solid rgba(212, 154, 61, 0.65);
          border-radius: 10px;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 8px 18px rgba(212, 154, 61, 0.14);
        }
        .venue-create-actions button:first-child:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .venue-create-cancel {
          min-height: 2.75rem;
          padding: 0.65rem 1rem;
          background: rgba(246, 239, 223, 0.03);
          color: var(--venue-cream-muted);
          border: 1px solid rgba(212, 154, 61, 0.16);
          border-radius: 10px;
          cursor: pointer;
        }
        .venue-landing-footer {
          margin-top: 1.35rem;
          font-size: 0.88rem;
          text-align: center;
        }
        .venue-landing-footer a {
          color: var(--venue-cream-muted);
          text-decoration-color: rgba(212, 154, 61, 0.45);
        }
        .venue-landing-footer a:hover {
          color: var(--venue-cream);
          text-decoration-color: rgba(212, 154, 61, 0.85);
        }
        .venue-create-section .message-error {
          margin: 0.25rem 0 0;
          color: #ffb7aa;
          background: rgba(195, 62, 43, 0.16);
          border: 1px solid rgba(195, 62, 43, 0.26);
          border-radius: 10px;
          padding: 0.6rem 0.7rem;
          font-size: 0.88rem;
        }
        @media (max-width: 520px) {
          .venue-landing-inner {
            padding: 1rem;
          }
          .venue-create-actions {
            flex-direction: column;
          }
          .venue-create-cancel {
            width: 100%;
          }
        }
      `}</style>
    </div>
  )
}
