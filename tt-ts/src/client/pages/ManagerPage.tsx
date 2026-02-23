import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { timesheet, shifts, users, audit, exportExcelUrl, exportPdfUrl } from '../api'

export function ManagerPage() {
  const { user } = useAuth()
  const [entries, setEntries] = useState<Array<{ id: string; employee: string; clock_in: string; clock_out: string | null; pay_rate_type: string }>>([])
  const [auditLogs, setAuditLogs] = useState<Array<{ id: string; action: string; changed_by: string; created_at: string }>>([])
  const [userList, setUserList] = useState<Array<{ id: string; username: string; display_name: string; role: string; active: boolean }>>([])
  const [tab, setTab] = useState<'entries' | 'add' | 'edit' | 'delete' | 'users' | 'audit'>('entries')

  useEffect(() => {
    timesheet.getAll().then((d) => setEntries(d.entries)).catch(() => setEntries([]))
    audit.list().then((d) => setAuditLogs(d.logs)).catch(() => setAuditLogs([]))
    users.list().then((d) => setUserList(d.users)).catch(() => setUserList([]))
  }, [])

  const staffGroups = entries.reduce<Record<string, typeof entries>>((acc, e) => {
    const key = e.employee.trim()
    if (!acc[key]) acc[key] = []
    acc[key].push(e)
    return acc
  }, {})

  return (
    <div className="page">
      <h2>Manager Dashboard</h2>
      <div className="card">
        <p className="success">Logged in as {user?.display_name}</p>
      </div>
      <div className="tabs">
        <button onClick={() => setTab('entries')} className={tab === 'entries' ? 'active' : ''}>
          View All Entries
        </button>
        <button onClick={() => setTab('add')} className={tab === 'add' ? 'active' : ''}>
          Add Shift
        </button>
        <button onClick={() => setTab('edit')} className={tab === 'edit' ? 'active' : ''}>
          Edit Shift
        </button>
        <button onClick={() => setTab('delete')} className={tab === 'delete' ? 'active' : ''}>
          Delete Entry
        </button>
        <button onClick={() => setTab('users')} className={tab === 'users' ? 'active' : ''}>
          Manage Users
        </button>
        <button onClick={() => setTab('audit')} className={tab === 'audit' ? 'active' : ''}>
          Audit Log
        </button>
      </div>
      {tab === 'entries' && (
        <div className="card">
          <h3>All Time Entries</h3>
          <div className="btn-row">
            <a href={exportExcelUrl()} download className="btn-primary" style={{ textDecoration: 'none' }}>
              Export All to Excel
            </a>
            <a href={exportPdfUrl()} download className="btn-secondary" style={{ textDecoration: 'none' }}>
              Export All to PDF
            </a>
          </div>
          {Object.entries(staffGroups).map(([staff, shifts]) => (
            <details key={staff}>
              <summary>{staff}</summary>
              <ul>
                {shifts.map((s) => (
                  <li key={s.id}>
                    {new Date(s.clock_in).toLocaleString('en-GB', { timeZone: 'Europe/London' })} —{' '}
                    {s.clock_out ? new Date(s.clock_out).toLocaleString('en-GB', { timeZone: 'Europe/London' }) : 'In Progress'} — {s.pay_rate_type}
                  </li>
                ))}
              </ul>
            </details>
          ))}
        </div>
      )}
      {tab === 'users' && (
        <div className="card">
          <h3>All Users</h3>
          <ul>
            {userList.map((u) => (
              <li key={u.id}>
                {u.display_name} ({u.username}) — {u.role} — {u.active ? 'Active' : 'Inactive'}
              </li>
            ))}
          </ul>
        </div>
      )}
      {tab === 'audit' && (
        <div className="card">
          <h3>Audit Log</h3>
          <ul>
            {auditLogs.map((l) => (
              <li key={l.id}>
                {l.action} by {l.changed_by} at {new Date(l.created_at).toLocaleString()}
              </li>
            ))}
          </ul>
        </div>
      )}
      {(tab === 'add' || tab === 'edit' || tab === 'delete') && (
        <div className="card">
          <p className="info">Full add/edit/delete forms would go here. Backend API is ready.</p>
        </div>
      )}
    </div>
  )
}
