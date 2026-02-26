import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { venues, type VenueSettings } from '../api'

export function VenueSettingsPage() {
  const { user, logout } = useAuth()
  const venueSlug = user?.venue?.slug
  const [settings, setSettings] = useState<VenueSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const [form, setForm] = useState({
    enhanced_enabled: true,
    enhanced_start_hour: 19,
    enhanced_end_hour: 4,
    break_deduct_enabled: true,
    break_deduct_minutes: 20,
    break_threshold_hours: 6,
    supervisor_enabled: true,
    supervisor_label: 'Supervisor',
    supervisor_deduct_break: true,
  })

  useEffect(() => {
    if (!venueSlug) return
    venues
      .getSettings(venueSlug)
      .then((s) => {
        setSettings(s)
        setForm({
          enhanced_enabled: s.enhanced_enabled,
          enhanced_start_hour: s.enhanced_start_hour,
          enhanced_end_hour: s.enhanced_end_hour,
          break_deduct_enabled: s.break_deduct_enabled,
          break_deduct_minutes: s.break_deduct_minutes,
          break_threshold_hours: s.break_threshold_hours,
          supervisor_enabled: s.supervisor_enabled,
          supervisor_label: s.supervisor_label,
          supervisor_deduct_break: s.supervisor_deduct_break,
        })
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false))
  }, [venueSlug])

  const handleDeleteAccount = async () => {
    if (!venueSlug) return
    setDeleting(true)
    setDeleteError('')
    try {
      const result = await venues.deleteAccount(venueSlug)
      await logout()
      window.location.href = result.redirectUrl ?? '/venues'
    } catch (e) {
      setDeleteError(e instanceof Error ? e.message : 'Failed to delete account')
      setDeleting(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!venueSlug) return
    setError('')
    setSuccess('')
    setSaving(true)
    try {
      await venues.updateSettings(venueSlug, form)
      setSuccess('Settings saved.')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  if (!venueSlug) {
    return <p>No venue in session.</p>
  }
  if (loading) {
    return <p>Loading...</p>
  }
  if (user?.role !== 'admin') {
    return <p>Only admins can change venue settings.</p>
  }

  return (
    <div className="venue-settings-page">
      <h2>Venue settings</h2>
      <p className="venue-settings-intro">
        Configure pay rules for {user?.venue?.name ?? venueSlug}. These affect how hours are split (Standard vs Enhanced) and break deductions in exports.
      </p>

      <form onSubmit={handleSubmit} className="venue-settings-form">
        <fieldset>
          <legend>Enhanced rate (night rate)</legend>
          <label>
            <input
              type="checkbox"
              checked={form.enhanced_enabled}
              onChange={(e) => setForm((f) => ({ ...f, enhanced_enabled: e.target.checked }))}
            />
            {' '}Use enhanced rate for night shifts
          </label>
          {form.enhanced_enabled && (
            <div className="form-row">
              <label>
                Start hour (0–23):
                <input
                  type="number"
                  min={0}
                  max={23}
                  value={form.enhanced_start_hour}
                  onChange={(e) => setForm((f) => ({ ...f, enhanced_start_hour: parseInt(e.target.value, 10) || 0 }))}
                />
              </label>
              <label>
                End hour (0–23):
                <input
                  type="number"
                  min={0}
                  max={23}
                  value={form.enhanced_end_hour}
                  onChange={(e) => setForm((f) => ({ ...f, enhanced_end_hour: parseInt(e.target.value, 10) || 0 }))}
                />
              </label>
            </div>
          )}
          <p className="form-hint">Default: 7 PM–4 AM (19–4). Hours outside this window use Standard rate.</p>
        </fieldset>

        <fieldset>
          <legend>Break deduction</legend>
          <label>
            <input
              type="checkbox"
              checked={form.break_deduct_enabled}
              onChange={(e) => setForm((f) => ({ ...f, break_deduct_enabled: e.target.checked }))}
            />
            {' '}Deduct unpaid break from shifts
          </label>
          {form.break_deduct_enabled && (
            <div className="form-row">
              <label>
                Break minutes:
                <input
                  type="number"
                  min={0}
                  max={120}
                  value={form.break_deduct_minutes}
                  onChange={(e) => setForm((f) => ({ ...f, break_deduct_minutes: parseInt(e.target.value, 10) || 0 }))}
                />
              </label>
              <label>
                Min shift hours for break:
                <input
                  type="number"
                  min={0}
                  max={24}
                  step={0.5}
                  value={form.break_threshold_hours}
                  onChange={(e) => setForm((f) => ({ ...f, break_threshold_hours: parseFloat(e.target.value) || 0 }))}
                />
              </label>
            </div>
          )}
          <p className="form-hint">Default: 20 min deducted for shifts of 6+ hours. Set to 0 to disable.</p>
        </fieldset>

        <fieldset>
          <legend>Supervisor</legend>
          <label>
            <input
              type="checkbox"
              checked={form.supervisor_enabled}
              onChange={(e) => setForm((f) => ({ ...f, supervisor_enabled: e.target.checked }))}
            />
            {' '}Enable supervisor role
          </label>
          <label>
            Label:
            <input
              type="text"
              value={form.supervisor_label}
              placeholder="Supervisor"
              maxLength={60}
              onChange={(e) => setForm((f) => ({ ...f, supervisor_label: e.target.value }))}
            />
          </label>
          <label>
            <input
              type="checkbox"
              checked={form.supervisor_deduct_break}
              onChange={(e) => setForm((f) => ({ ...f, supervisor_deduct_break: e.target.checked }))}
            />
            {' '}Deduct break from supervisor hours
          </label>
          <p className="form-hint">
            Rename the supervisor role for Clock/Manager/exports. Disable to hide supervisor in day-to-day workflows.
          </p>
        </fieldset>

        {error && <p className="message-error">{error}</p>}
        {success && <p className="message-success">{success}</p>}
        <button type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Save settings'}
        </button>
      </form>

      <section className="account-actions">
        <h3>Account data</h3>
        <p className="form-hint">Download all venue data (staff, time entries) as a JSON file.</p>
        <button
          type="button"
          onClick={() => { window.location.href = venues.exportAccountData(venueSlug) }}
        >
          Export account data
        </button>
      </section>

      <section className="account-actions delete-account-section">
        <h3>Delete account</h3>
        <p className="form-hint">Permanently delete this venue and all associated data. This cannot be undone.</p>
        <button
          type="button"
          className="btn-danger"
          onClick={() => { setShowDeleteModal(true); setDeleteConfirm(''); setDeleteError('') }}
        >
          Delete account
        </button>
      </section>

      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Delete account</h3>
            <p>This will permanently delete <strong>{user?.venue?.name ?? venueSlug}</strong> and all its data. Type the venue name to confirm:</p>
            <input
              type="text"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder={user?.venue?.name ?? venueSlug}
              autoFocus
            />
            {deleteError && <p className="message-error">{deleteError}</p>}
            <div className="modal-actions">
              <button
                type="button"
                className="btn-danger"
                disabled={deleting || deleteConfirm !== (user?.venue?.name ?? venueSlug)}
                onClick={handleDeleteAccount}
              >
                {deleting ? 'Deleting...' : 'Confirm delete'}
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .venue-settings-page { max-width: 520px; }
        .venue-settings-intro { color: var(--tt-text-muted, #666); margin-bottom: 1.5rem; }
        .account-actions { margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid var(--tt-border, #ddd); }
        .account-actions h3 { margin-bottom: 0.5rem; }
        .account-actions button { margin-top: 0.75rem; }
        .venue-settings-form fieldset {
          border: 1px solid var(--tt-border, #ddd);
          border-radius: 6px;
          padding: 1rem;
          margin-bottom: 1rem;
        }
        .venue-settings-form legend { font-weight: 600; }
        .venue-settings-form label { display: block; margin: 0.5rem 0; }
        .venue-settings-form label input[type="number"] {
          margin-left: 0.5rem;
          width: 4rem;
          padding: 0.3rem;
        }
        .venue-settings-form label input[type="text"] {
          margin-left: 0.5rem;
          width: min(18rem, 100%);
          padding: 0.3rem;
        }
        .form-row { display: flex; gap: 1.5rem; flex-wrap: wrap; }
        .form-hint { font-size: 0.85rem; color: var(--tt-text-muted, #666); margin-top: 0.5rem; }
        .delete-account-section { border-top-color: #f8d7da; }
        .btn-danger { background: #c0392b; color: #fff; border: none; padding: 0.4rem 0.9rem; border-radius: 4px; cursor: pointer; }
        .btn-danger:disabled { opacity: 0.5; cursor: not-allowed; }
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.45); display: flex; align-items: center; justify-content: center; z-index: 1000; }
        .modal-box { background: #fff; border-radius: 8px; padding: 1.5rem; max-width: 400px; width: 90%; box-shadow: 0 4px 24px rgba(0,0,0,0.2); }
        .modal-box h3 { margin-top: 0; }
        .modal-box input { width: 100%; padding: 0.4rem; margin: 0.75rem 0; box-sizing: border-box; }
        .modal-actions { display: flex; gap: 0.75rem; margin-top: 0.5rem; }
      `}</style>
    </div>
  )
}
