import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { clock } from '../api'

export function ClockPage() {
  const { user } = useAuth()
  const displayName = user?.display_name || user?.username || 'User'
  const [openShift, setOpenShift] = useState<{ id: string; clock_in: string; pay_rate_type: string } | null>(null)
  const [isSupervisor, setIsSupervisor] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const loadOpenShift = async () => {
    try {
      const data = await clock.open()
      setOpenShift(data.shift)
    } catch {
      setOpenShift(null)
    }
  }

  useEffect(() => {
    loadOpenShift()
  }, [])

  const handleClockIn = async () => {
    setMessage(null)
    try {
      await clock.in(isSupervisor)
      setMessage({ type: 'success', text: `${displayName} clocked in successfully` })
      loadOpenShift()
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Clock in failed' })
    }
  }

  const handleClockOut = async () => {
    setMessage(null)
    try {
      await clock.out()
      setMessage({ type: 'success', text: `${displayName} clocked out successfully` })
      loadOpenShift()
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Clock out failed' })
    }
  }

  const bstTime = openShift?.clock_in
    ? new Date(openShift.clock_in).toLocaleString('en-GB', { timeZone: 'Europe/London' })
    : ''
  const clockStatus = openShift ? 'Clocked In' : 'Clocked Out'

  return (
    <div className="page page-dashboard">
      <h2>Employee Clock In/Out</h2>
      <div className="card">
        <p>Clocking in/out as: <strong>{displayName}</strong></p>
      </div>
      <div className="stat-cards">
        <div className="stat-card">
          <span className="stat-value">{clockStatus}</span>
          <span className="stat-label">Current Status</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{isSupervisor ? 'Supervisor' : 'Employee'}</span>
          <span className="stat-label">Next Clock In Role</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{openShift?.pay_rate_type ?? 'N/A'}</span>
          <span className="stat-label">Open Shift Pay Rate</span>
        </div>
      </div>
      <div className="cards-grid">
        <div className="card">
          <h3>Clock In/Out</h3>
          <label>
            <input
              type="checkbox"
              checked={isSupervisor}
              onChange={(e) => setIsSupervisor(e.target.checked)}
            />
            Supervisor Role
          </label>
          <div className="btn-row">
            <button onClick={handleClockIn} className="btn-primary" disabled={!!openShift}>
              Clock In
            </button>
            <button onClick={handleClockOut} className="btn-secondary" disabled={!openShift}>
              Clock Out
            </button>
          </div>
        </div>
        <div className="card">
          <h3>Quick Status</h3>
          <p>
            <span className={`badge ${openShift ? 'badge-status-active' : 'badge-status-inactive'}`}>
              {clockStatus}
            </span>
          </p>
          {openShift ? (
            <>
              <p className="message-success">{displayName} is currently clocked in</p>
              <p>Clocked in at: {bstTime} BST</p>
              <p>
                Pay Rate:{' '}
                <span className="badge">{openShift.pay_rate_type}</span>
              </p>
            </>
          ) : (
            <p className="message-info">{displayName} is not currently clocked in</p>
          )}
        </div>
      </div>
      {message && (
        <p className={`message-${message.type}`}>{message.text}</p>
      )}
    </div>
  )
}
