import React, { useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { venues } from '../api'

const SEARCH_DEBOUNCE_MS = 300

export function VenueLandingPage() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<{ slug: string; name: string }[]>([])
  const [searching, setSearching] = useState(false)
  const [createMode, setCreateMode] = useState(false)
  const [createVenueName, setCreateVenueName] = useState('')
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
    if (!createVenueName.trim() || !createUsername.trim() || !createDisplayName.trim() || !createPassword) {
      setCreateError('All fields are required')
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
        adminUsername: createUsername.trim(),
        adminDisplayName: createDisplayName.trim(),
        adminPassword: createPassword,
      })
      window.location.href = res.redirectUrl
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
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          background: var(--tt-bg, #f8f9fa);
        }
        .venue-landing-inner {
          max-width: 420px;
          width: 100%;
        }
        .venue-landing-title {
          font-size: 1.75rem;
          font-weight: 700;
          margin-bottom: 0.25rem;
          color: var(--tt-text, #1a1a1a);
        }
        .venue-landing-subtitle {
          font-size: 0.95rem;
          color: var(--tt-text-muted, #666);
          margin-bottom: 2rem;
        }
        .venue-search-section label,
        .venue-create-section h2 {
          display: block;
          font-size: 0.875rem;
          font-weight: 500;
          margin-bottom: 0.5rem;
          color: var(--tt-text, #1a1a1a);
        }
        .venue-search-section input,
        .venue-create-section input {
          width: 100%;
          padding: 0.6rem 0.75rem;
          border: 1px solid var(--tt-border, #ddd);
          border-radius: 6px;
          font-size: 1rem;
          margin-bottom: 0.5rem;
        }
        .venue-search-hint {
          font-size: 0.8rem;
          color: var(--tt-text-muted, #666);
          margin-bottom: 0.5rem;
        }
        .venue-search-results {
          list-style: none;
          margin: 0;
          padding: 0;
          border: 1px solid var(--tt-border, #ddd);
          border-radius: 6px;
          background: white;
          margin-top: 0.5rem;
        }
        .venue-search-results li a {
          display: block;
          padding: 0.6rem 0.75rem;
          color: var(--tt-text, #1a1a1a);
          text-decoration: none;
        }
        .venue-search-results li a:hover {
          background: var(--tt-bg-hover, #f0f0f0);
        }
        .venue-landing-divider {
          text-align: center;
          margin: 1.5rem 0;
          color: var(--tt-text-muted, #666);
          font-size: 0.875rem;
        }
        .venue-create-toggle {
          width: 100%;
          padding: 0.6rem 1rem;
          background: var(--tt-primary, #2563eb);
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 1rem;
          cursor: pointer;
        }
        .venue-create-toggle:hover {
          opacity: 0.9;
        }
        .venue-create-section h2 {
          margin-bottom: 1rem;
        }
        .venue-create-actions {
          display: flex;
          gap: 0.5rem;
          margin-top: 0.75rem;
        }
        .venue-create-actions button:first-child {
          flex: 1;
          padding: 0.6rem 1rem;
          background: var(--tt-primary, #2563eb);
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
        }
        .venue-create-cancel {
          padding: 0.6rem 1rem;
          background: transparent;
          color: var(--tt-text-muted, #666);
          border: 1px solid var(--tt-border, #ddd);
          border-radius: 6px;
          cursor: pointer;
        }
        .venue-landing-footer {
          margin-top: 2rem;
          font-size: 0.85rem;
          text-align: center;
        }
        .venue-landing-footer a {
          color: var(--tt-primary, #2563eb);
        }
      `}</style>
    </div>
  )
}
