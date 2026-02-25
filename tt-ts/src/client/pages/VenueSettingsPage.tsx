import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { venues, type VenueSettings } from '../api'

export function VenueSettingsPage() {
  const { user } = useAuth()
  const venueSlug = user?.venue?.slug
  const [settings, setSettings] = useState<VenueSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
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

      <style>{`
        .venue-settings-page { max-width: 520px; }
        .venue-settings-intro { color: var(--tt-text-muted, #666); margin-bottom: 1.5rem; }
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
      `}</style>
    </div>
  )
}
