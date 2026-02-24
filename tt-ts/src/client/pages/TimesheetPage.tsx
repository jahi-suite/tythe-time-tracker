import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { timesheet } from '../api'

export function TimesheetPage() {
  const { user } = useAuth()
  const displayName = user?.display_name || user?.username || 'Unknown user'
  const [entries, setEntries] = useState<Array<{ id: string; clock_in: string; clock_out: string | null; pay_rate_type: string }>>([])

  useEffect(() => {
    timesheet.get().then((d) => setEntries(d.entries)).catch(() => setEntries([]))
  }, [])

  const formatRow = (e: (typeof entries)[0]) => {
    const inDate = new Date(e.clock_in)
    const outDate = e.clock_out ? new Date(e.clock_out) : null
    const inStr = inDate.toLocaleString('en-GB', { timeZone: 'Europe/London' })
    const outStr = outDate ? outDate.toLocaleString('en-GB', { timeZone: 'Europe/London' }) : 'Still Open'
    const duration = outDate
      ? ((outDate.getTime() - inDate.getTime()) / 3600000).toFixed(2) + 'h'
      : 'In Progress'
    return {
      date: inStr.slice(0, 10),
      clockIn: inStr.slice(11, 19),
      clockOut: outStr.slice(11, 19),
      duration,
      payRate: e.pay_rate_type,
    }
  }

  const closedEntries = entries.filter((e) => !!e.clock_out)
  const openEntries = entries.length - closedEntries.length
  const totalHours = closedEntries
    .reduce((sum, e) => {
      if (!e.clock_out) return sum
      return sum + (new Date(e.clock_out).getTime() - new Date(e.clock_in).getTime()) / 3600000
    }, 0)
    .toFixed(2)
  const payRateTypes = new Set(entries.map((e) => e.pay_rate_type)).size

  return (
    <div className="page page-dashboard timesheet-dashboard">
      <h2>Personal Timesheet</h2>
      <div className="card">
        <p>Showing timesheet for: <strong>{displayName}</strong></p>
      </div>
      <div className="stat-cards">
        <div className="stat-card">
          <span className="stat-value">{entries.length}</span>
          <span className="stat-label">Entries</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{openEntries}</span>
          <span className="stat-label">Open Shifts</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{totalHours}h</span>
          <span className="stat-label">Logged Hours</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{payRateTypes || 0}</span>
          <span className="stat-label">Pay Rates Used</span>
        </div>
      </div>
      {entries.length > 0 ? (
        <div className="cards-grid">
          <div className="card timesheet-table-card">
            <h3>Timesheet for {displayName}</h3>
            <div className="timesheet-table-wrap">
              <table className="timesheet-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Clock-In</th>
                    <th>Clock-Out</th>
                    <th>Duration</th>
                    <th>Status</th>
                    <th>Pay Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((e) => {
                    const r = formatRow(e)
                    const isOpen = !e.clock_out
                    return (
                      <tr key={e.id}>
                        <td>{r.date}</td>
                        <td>{r.clockIn}</td>
                        <td>{r.clockOut}</td>
                        <td>{r.duration}</td>
                        <td>
                          <span className={`badge ${isOpen ? 'badge-status-active' : 'badge-status-inactive'}`}>
                            {isOpen ? 'Open' : 'Closed'}
                          </span>
                        </td>
                        <td>
                          <span className="badge timesheet-pay-rate-badge">{r.payRate}</span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="card">
          <p className="message-info">No time entries found for {displayName}</p>
        </div>
      )}
    </div>
  )
}
