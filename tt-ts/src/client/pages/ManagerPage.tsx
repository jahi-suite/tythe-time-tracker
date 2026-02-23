import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { timesheet, shifts, users, audit, exportExcelUrl, exportPdfUrl } from '../api'

type AddShiftFormState = {
  employeeName: string
  clockInDate: string
  clockInTime: string
  clockOutDate: string
  clockOutTime: string
  isSupervisor: boolean
  payRateOverride: '' | 'Standard' | 'Enhanced' | 'Supervisor'
}

const DEFAULT_ADD_SHIFT_FORM: AddShiftFormState = {
  employeeName: '',
  clockInDate: '',
  clockInTime: '',
  clockOutDate: '',
  clockOutTime: '',
  isSupervisor: false,
  payRateOverride: '',
}

export function ManagerPage() {
  const { user } = useAuth()
  const [entries, setEntries] = useState<Array<{ id: string; employee: string; clock_in: string; clock_out: string | null; pay_rate_type: string }>>([])
  const [auditLogs, setAuditLogs] = useState<Array<{ id: string; action: string; changed_by: string; created_at: string }>>([])
  const [userList, setUserList] = useState<Array<{ id: string; username: string; display_name: string; role: string; active: boolean }>>([])
  const [tab, setTab] = useState<'entries' | 'add' | 'edit' | 'delete' | 'users' | 'audit'>('entries')
  const [addShiftForm, setAddShiftForm] = useState<AddShiftFormState>(DEFAULT_ADD_SHIFT_FORM)
  const [addShiftError, setAddShiftError] = useState('')
  const [addShiftSuccess, setAddShiftSuccess] = useState('')
  const [addShiftSubmitting, setAddShiftSubmitting] = useState(false)

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

  const toIsoDateString = (dateValue: string) => `${dateValue}T00:00:00.000Z`
  const toIsoTimeString = (timeValue: string) => `1970-01-01T${timeValue}:00.000Z`

  async function handleAddShiftSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setAddShiftError('')
    setAddShiftSuccess('')

    const employeeName = addShiftForm.employeeName.trim()
    if (!employeeName) {
      setAddShiftError('Please enter an employee name.')
      return
    }
    if (!addShiftForm.clockInDate || !addShiftForm.clockInTime) {
      setAddShiftError('Clock-in date and time are required.')
      return
    }

    const hasClockOutDate = Boolean(addShiftForm.clockOutDate)
    const hasClockOutTime = Boolean(addShiftForm.clockOutTime)
    if (hasClockOutDate !== hasClockOutTime) {
      setAddShiftError('Provide both clock-out date and clock-out time, or leave both blank.')
      return
    }

    setAddShiftSubmitting(true)
    try {
      await shifts.add({
        employeeName,
        clockInDate: toIsoDateString(addShiftForm.clockInDate),
        clockInTime: toIsoTimeString(addShiftForm.clockInTime),
        clockOutDate: hasClockOutDate ? toIsoDateString(addShiftForm.clockOutDate) : undefined,
        clockOutTime: hasClockOutTime ? toIsoTimeString(addShiftForm.clockOutTime) : undefined,
        isSupervisor: addShiftForm.isSupervisor,
        payRateOverride: addShiftForm.payRateOverride || undefined,
      })
      setAddShiftSuccess(`Shift added for ${employeeName}.`)
      setAddShiftForm(DEFAULT_ADD_SHIFT_FORM)
      timesheet.getAll().then((d) => setEntries(d.entries)).catch(() => setEntries([]))
    } catch (err) {
      setAddShiftError(err instanceof Error ? err.message : 'Failed to add shift.')
    } finally {
      setAddShiftSubmitting(false)
    }
  }

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
      {tab === 'add' && (
        <div className="card">
          <h3>Add Shift Manually</h3>
          <form onSubmit={handleAddShiftSubmit}>
            <label>
              Employee Name:
              <input
                type="text"
                value={addShiftForm.employeeName}
                onChange={(e) => setAddShiftForm((prev) => ({ ...prev, employeeName: e.target.value }))}
                placeholder="Employee name"
              />
            </label>
            <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
              <label>
                Clock-In Date:
                <input
                  type="date"
                  value={addShiftForm.clockInDate}
                  onChange={(e) => setAddShiftForm((prev) => ({ ...prev, clockInDate: e.target.value }))}
                  required
                />
              </label>
              <label>
                Clock-In Time:
                <input
                  type="time"
                  value={addShiftForm.clockInTime}
                  onChange={(e) => setAddShiftForm((prev) => ({ ...prev, clockInTime: e.target.value }))}
                  required
                />
              </label>
              <label>
                Clock-Out Date (optional):
                <input
                  type="date"
                  value={addShiftForm.clockOutDate}
                  onChange={(e) => setAddShiftForm((prev) => ({ ...prev, clockOutDate: e.target.value }))}
                />
              </label>
              <label>
                Clock-Out Time (optional):
                <input
                  type="time"
                  value={addShiftForm.clockOutTime}
                  onChange={(e) => setAddShiftForm((prev) => ({ ...prev, clockOutTime: e.target.value }))}
                />
              </label>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem' }}>
              <input
                type="checkbox"
                checked={addShiftForm.isSupervisor}
                onChange={(e) => setAddShiftForm((prev) => ({ ...prev, isSupervisor: e.target.checked }))}
                style={{ width: 'auto' }}
              />
              Supervisor Role
            </label>
            <label>
              Pay Rate Override (optional):
              <select
                value={addShiftForm.payRateOverride}
                onChange={(e) =>
                  setAddShiftForm((prev) => ({
                    ...prev,
                    payRateOverride: e.target.value as AddShiftFormState['payRateOverride'],
                  }))
                }
              >
                <option value="">Auto-calculate</option>
                <option value="Standard">Standard</option>
                <option value="Enhanced">Enhanced</option>
                <option value="Supervisor">Supervisor</option>
              </select>
            </label>
            {addShiftError && <p className="error">{addShiftError}</p>}
            {addShiftSuccess && <p className="success">{addShiftSuccess}</p>}
            <div className="btn-row">
              <button type="submit" className="btn-primary" disabled={addShiftSubmitting}>
                {addShiftSubmitting ? 'Adding...' : 'Add Shift'}
              </button>
            </div>
          </form>
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
      {(tab === 'edit' || tab === 'delete') && (
        <div className="card">
          <p className="info">{tab === 'edit' ? 'Edit Shift form coming in the next parity story.' : 'Delete Entry form coming in the next parity story.'}</p>
        </div>
      )}
    </div>
  )
}
