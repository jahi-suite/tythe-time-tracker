import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { clock } from '../api'

export function ClockPage() {
  const { user } = useAuth()
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
      setMessage({ type: 'success', text: `${user?.display_name} clocked in successfully` })
      loadOpenShift()
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Clock in failed' })
    }
  }

  const handleClockOut = async () => {
    setMessage(null)
    try {
      await clock.out()
      setMessage({ type: 'success', text: `${user?.display_name} clocked out successfully` })
      loadOpenShift()
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Clock out failed' })
    }
  }

  const bstTime = openShift?.clock_in
    ? new Date(openShift.clock_in).toLocaleString('en-GB', { timeZone: 'Europe/London' })
    : ''

  return (
    <div className="page">
      <h2>Employee Clock In/Out</h2>
      <div className="card">
        <p>Clocking in/out as: <strong>{user?.display_name}</strong></p>
      </div>
      <div className="grid-2">
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
          {openShift ? (
            <>
              <p className="success">{user?.display_name} is currently clocked in</p>
              <p>Clocked in at: {bstTime} BST</p>
              <p>Pay Rate: {openShift.pay_rate_type}</p>
            </>
          ) : (
            <p className="info">{user?.display_name} is not currently clocked in</p>
          )}
        </div>
      </div>
      {message && (
        <p className={message.type}>{message.text}</p>
      )}
    </div>
  )
}
