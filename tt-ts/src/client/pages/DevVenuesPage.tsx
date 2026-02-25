import React from 'react'

type DevVenue = {
  name: string
  slug: string
  active: boolean
  staff_count: number
  last_used: string | null
}

type LoadState =
  | { kind: 'loading' }
  | { kind: 'disabled' }
  | { kind: 'localhost-only' }
  | { kind: 'secret-required'; error?: string }
  | { kind: 'error'; message: string }
  | { kind: 'ready'; venues: DevVenue[] }

function isLocalhost(): boolean {
  if (typeof window === 'undefined') return false
  const host = window.location.hostname.toLowerCase()
  return host === 'localhost' || host === '127.0.0.1' || host === '[::1]'
}

function formatLastUsed(value: string | null): string {
  if (!value) return 'Never'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleString()
}

export function DevVenuesPage() {
  const [state, setState] = React.useState<LoadState>({ kind: 'loading' })
  const [secretInput, setSecretInput] = React.useState('')
  const [submittingSecret, setSubmittingSecret] = React.useState(false)
  const [actionSlug, setActionSlug] = React.useState<string | null>(null)
  const [actionError, setActionError] = React.useState<string | null>(null)

  const loadVenues = React.useCallback(async () => {
    if (!isLocalhost()) {
      setState({ kind: 'localhost-only' })
      return
    }

    setState({ kind: 'loading' })

    let res: Response
    try {
      res = await fetch('/api/dev/venues', { credentials: 'include' })
    } catch {
      setState({ kind: 'error', message: 'Could not connect to the API.' })
      return
    }

    if (res.status === 404) {
      setState({ kind: 'disabled' })
      return
    }

    if (res.status === 401) {
      setState({ kind: 'secret-required' })
      return
    }

    if (!res.ok) {
      setState({ kind: 'error', message: `Request failed (${res.status})` })
      return
    }

    const data = (await res.json()) as DevVenue[]
    setState({ kind: 'ready', venues: Array.isArray(data) ? data : [] })
  }, [])

  React.useEffect(() => {
    void loadVenues()
  }, [loadVenues])

  const handleVenueAction = async (venue: DevVenue, action: 'deactivate' | 'reactivate') => {
    if (action === 'deactivate') {
      const confirmed = window.confirm(
        `Deactivate ${venue.name}? They won't be able to log in.`,
      )
      if (!confirmed) return
    }

    setActionError(null)
    setActionSlug(venue.slug)

    let res: Response
    try {
      res = await fetch(`/api/dev/venues/${encodeURIComponent(venue.slug)}/${action}`, {
        method: 'POST',
        credentials: 'include',
      })
    } catch {
      setActionError(`Could not ${action} venue.`)
      setActionSlug(null)
      return
    }

    if (!res.ok) {
      let message = `Could not ${action} venue (${res.status}).`
      try {
        const data = (await res.json()) as { error?: string }
        if (typeof data.error === 'string' && data.error.trim()) message = data.error
      } catch {
        // Ignore JSON parse failures and use the status fallback.
      }
      setActionError(message)
      setActionSlug(null)
      return
    }

    setActionSlug(null)
    await loadVenues()
  }

  const handleSecretSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const secret = secretInput.trim()
    if (!secret) {
      setState({ kind: 'secret-required', error: 'Enter a dev secret.' })
      return
    }

    setSubmittingSecret(true)
    document.cookie = `dev_secret=${encodeURIComponent(secret)}; Path=/; SameSite=Lax`
    setSecretInput('')
    await loadVenues()
    setSubmittingSecret(false)
  }

  return (
    <div className="dev-venues-page">
      <div className="dev-venues-card">
        <h1>Dev Venues</h1>
        <p className="dev-venues-subtitle">Venue names, slugs, staff count, and last activity.</p>

        {state.kind === 'loading' && <p>Loading venues...</p>}

        {state.kind === 'localhost-only' && (
          <p>Dev venues is only available on localhost. It will never work on the main site.</p>
        )}

        {state.kind === 'disabled' && (
          <p>Dev venues list is disabled. Set DEV_VENUES_ENABLED=true to enable.</p>
        )}

        {state.kind === 'error' && <p className="message-error">{state.message}</p>}
        {actionError && <p className="message-error">{actionError}</p>}

        {state.kind === 'secret-required' && (
          <form onSubmit={handleSecretSubmit} className="dev-secret-form">
            <label htmlFor="dev-secret-input">Dev secret</label>
            <div className="dev-secret-row">
              <input
                id="dev-secret-input"
                type="password"
                value={secretInput}
                onChange={(e) => setSecretInput(e.target.value)}
                autoComplete="off"
                placeholder="Enter DEV_SECRET"
              />
              <button type="submit" disabled={submittingSecret}>
                {submittingSecret ? 'Checking...' : 'Unlock'}
              </button>
            </div>
            {state.error && <p className="message-error">{state.error}</p>}
          </form>
        )}

        {state.kind === 'ready' && (
          <div className="dev-venues-table-wrap">
            <table className="dev-venues-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Slug</th>
                  <th>Status</th>
                  <th>Staff</th>
                  <th>Last used</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {state.venues.map((venue) => (
                  <tr key={venue.slug}>
                    <td>{venue.name}</td>
                    <td>{venue.slug}</td>
                    <td>
                      {venue.active ? (
                        <span className="status-badge status-badge-active">Active</span>
                      ) : (
                        <span className="status-badge status-badge-inactive">Inactive</span>
                      )}
                    </td>
                    <td>{venue.staff_count}</td>
                    <td title={venue.last_used ?? ''}>{formatLastUsed(venue.last_used)}</td>
                    <td>
                      {venue.active && venue.slug !== 'tythe' && (
                        <button
                          type="button"
                          className="venue-action-button venue-action-danger"
                          disabled={actionSlug === venue.slug}
                          onClick={() => void handleVenueAction(venue, 'deactivate')}
                        >
                          {actionSlug === venue.slug ? 'Deactivating...' : 'Deactivate'}
                        </button>
                      )}
                      {!venue.active && (
                        <button
                          type="button"
                          className="venue-action-button venue-action-primary"
                          disabled={actionSlug === venue.slug}
                          onClick={() => void handleVenueAction(venue, 'reactivate')}
                        >
                          {actionSlug === venue.slug ? 'Reactivating...' : 'Reactivate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {state.venues.length === 0 && (
                  <tr>
                    <td colSpan={6}>No venues found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`
        .dev-venues-page {
          min-height: 100vh;
          padding: 2rem 1rem;
          background: #f6f7fb;
          color: #1f2937;
        }
        .dev-venues-card {
          max-width: 960px;
          margin: 0 auto;
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          padding: 1.25rem;
          box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
        }
        .dev-venues-card h1 {
          margin: 0 0 0.25rem;
          font-size: 1.5rem;
        }
        .dev-venues-subtitle {
          margin: 0 0 1rem;
          color: #6b7280;
          font-size: 0.95rem;
        }
        .dev-secret-form label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 600;
        }
        .dev-secret-row {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        .dev-secret-row input {
          flex: 1 1 280px;
          min-width: 0;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          padding: 0.6rem 0.75rem;
        }
        .dev-secret-row button {
          border: 0;
          border-radius: 6px;
          padding: 0.6rem 0.9rem;
          background: #111827;
          color: #fff;
          cursor: pointer;
        }
        .dev-secret-row button:disabled {
          opacity: 0.6;
          cursor: default;
        }
        .dev-venues-table-wrap {
          overflow-x: auto;
        }
        .dev-venues-table {
          width: 100%;
          border-collapse: collapse;
        }
        .dev-venues-table th,
        .dev-venues-table td {
          text-align: left;
          border-bottom: 1px solid #e5e7eb;
          padding: 0.7rem 0.5rem;
          vertical-align: top;
        }
        .dev-venues-table th {
          font-size: 0.85rem;
          color: #6b7280;
          font-weight: 600;
        }
        .dev-venues-table td {
          font-size: 0.95rem;
        }
        .status-badge {
          display: inline-flex;
          align-items: center;
          border-radius: 999px;
          padding: 0.12rem 0.55rem;
          font-size: 0.78rem;
          font-weight: 600;
          line-height: 1.4;
          border: 1px solid transparent;
          white-space: nowrap;
        }
        .status-badge-active {
          color: #065f46;
          background: #ecfdf5;
          border-color: #a7f3d0;
        }
        .status-badge-inactive {
          color: #991b1b;
          background: #fef2f2;
          border-color: #fecaca;
        }
        .venue-action-button {
          border: 1px solid #d1d5db;
          border-radius: 6px;
          padding: 0.35rem 0.6rem;
          font-size: 0.85rem;
          font-weight: 600;
          background: #fff;
          cursor: pointer;
          white-space: nowrap;
        }
        .venue-action-button:disabled {
          opacity: 0.6;
          cursor: default;
        }
        .venue-action-primary {
          color: #1d4ed8;
          border-color: #bfdbfe;
          background: #eff6ff;
        }
        .venue-action-danger {
          color: #b91c1c;
          border-color: #fecaca;
          background: #fef2f2;
        }
        @media (max-width: 640px) {
          .dev-venues-card {
            padding: 1rem;
          }
          .dev-venues-table th,
          .dev-venues-table td {
            padding: 0.55rem 0.4rem;
            font-size: 0.9rem;
          }
        }
      `}</style>
    </div>
  )
}
