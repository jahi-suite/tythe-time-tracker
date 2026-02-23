import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { timesheet } from '../api'

export function TimesheetPage() {
  const { user } = useAuth()
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

  return (
    <div className="page">
      <h2>Personal Timesheet</h2>
      <div className="card">
        <p>Showing timesheet for: <strong>{user?.display_name}</strong></p>
      </div>
      {entries.length > 0 ? (
        <div className="card">
          <h3>Timesheet for {user?.display_name}</h3>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Clock-In</th>
                <th>Clock-Out</th>
                <th>Duration</th>
                <th>Pay Rate</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => {
                const r = formatRow(e)
                return (
                  <tr key={e.id}>
                    <td>{r.date}</td>
                    <td>{r.clockIn}</td>
                    <td>{r.clockOut}</td>
                    <td>{r.duration}</td>
                    <td>{r.payRate}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card">
          <p className="message-info">No time entries found for {user?.display_name}</p>
        </div>
      )}
    </div>
  )
}
