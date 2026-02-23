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
type EditShiftFormState = AddShiftFormState
type CreateUserFormState = {
  username: string
  displayName: string
  password: string
  role: 'employee' | 'manager' | 'admin'
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
const DEFAULT_EDIT_SHIFT_FORM: EditShiftFormState = {
  employeeName: '',
  clockInDate: '',
  clockInTime: '',
  clockOutDate: '',
  clockOutTime: '',
  isSupervisor: false,
  payRateOverride: '',
}
const DEFAULT_CREATE_USER_FORM: CreateUserFormState = {
  username: '',
  displayName: '',
  password: '',
  role: 'employee',
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
  const [editShiftEntryId, setEditShiftEntryId] = useState('')
  const [editShiftForm, setEditShiftForm] = useState<EditShiftFormState>(DEFAULT_EDIT_SHIFT_FORM)
  const [editShiftLoadedId, setEditShiftLoadedId] = useState<string | null>(null)
  const [editShiftLookupError, setEditShiftLookupError] = useState('')
  const [editShiftLookupSuccess, setEditShiftLookupSuccess] = useState('')
  const [editShiftError, setEditShiftError] = useState('')
  const [editShiftSuccess, setEditShiftSuccess] = useState('')
  const [editShiftLoading, setEditShiftLoading] = useState(false)
  const [editShiftSubmitting, setEditShiftSubmitting] = useState(false)
  const [deleteShiftEntryId, setDeleteShiftEntryId] = useState('')
  const [deleteShiftError, setDeleteShiftError] = useState('')
  const [deleteShiftSuccess, setDeleteShiftSuccess] = useState('')
  const [deleteShiftSubmitting, setDeleteShiftSubmitting] = useState(false)
  const [createUserForm, setCreateUserForm] = useState<CreateUserFormState>(DEFAULT_CREATE_USER_FORM)
  const [createUserError, setCreateUserError] = useState('')
  const [createUserSuccess, setCreateUserSuccess] = useState('')
  const [createUserSubmitting, setCreateUserSubmitting] = useState(false)

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
  const toDateInputValueInLondon = (isoValue: string) => {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/London',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(new Date(isoValue))
    const year = parts.find((part) => part.type === 'year')?.value ?? ''
    const month = parts.find((part) => part.type === 'month')?.value ?? ''
    const day = parts.find((part) => part.type === 'day')?.value ?? ''
    return `${year}-${month}-${day}`
  }
  const toTimeInputValueInLondon = (isoValue: string) => {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/London',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).formatToParts(new Date(isoValue))
    const hour = parts.find((part) => part.type === 'hour')?.value ?? ''
    const minute = parts.find((part) => part.type === 'minute')?.value ?? ''
    return `${hour}:${minute}`
  }

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

  async function handleEditShiftLoad(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setEditShiftLookupError('')
    setEditShiftLookupSuccess('')
    setEditShiftError('')
    setEditShiftSuccess('')

    const entryId = editShiftEntryId.trim()
    if (!entryId) {
      setEditShiftLookupError('Please enter an Entry ID to edit a shift.')
      setEditShiftLoadedId(null)
      return
    }

    setEditShiftLoading(true)
    try {
      const shift = await shifts.get(entryId)
      setEditShiftForm({
        employeeName: shift.employee ?? '',
        clockInDate: toDateInputValueInLondon(shift.clock_in),
        clockInTime: toTimeInputValueInLondon(shift.clock_in),
        clockOutDate: shift.clock_out ? toDateInputValueInLondon(shift.clock_out) : '',
        clockOutTime: shift.clock_out ? toTimeInputValueInLondon(shift.clock_out) : '',
        isSupervisor: shift.pay_rate_type === 'Supervisor',
        payRateOverride:
          shift.pay_rate_type === 'Standard' || shift.pay_rate_type === 'Enhanced' || shift.pay_rate_type === 'Supervisor'
            ? shift.pay_rate_type
            : '',
      })
      setEditShiftLoadedId(shift.id)
      setEditShiftLookupSuccess(`Found shift for ${shift.employee}.`)
    } catch (err) {
      setEditShiftLoadedId(null)
      setEditShiftForm(DEFAULT_EDIT_SHIFT_FORM)
      setEditShiftLookupError(err instanceof Error ? err.message : 'Failed to load shift.')
    } finally {
      setEditShiftLoading(false)
    }
  }

  async function handleEditShiftSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setEditShiftError('')
    setEditShiftSuccess('')

    if (!editShiftLoadedId) {
      setEditShiftError('Load a shift before updating it.')
      return
    }

    const employeeName = editShiftForm.employeeName.trim()
    if (!employeeName) {
      setEditShiftError('Please enter an employee name.')
      return
    }
    if (!editShiftForm.clockInDate || !editShiftForm.clockInTime) {
      setEditShiftError('Clock-in date and time are required.')
      return
    }

    const hasClockOutDate = Boolean(editShiftForm.clockOutDate)
    const hasClockOutTime = Boolean(editShiftForm.clockOutTime)
    if (hasClockOutDate !== hasClockOutTime) {
      setEditShiftError('Provide both clock-out date and clock-out time, or leave both blank.')
      return
    }

    setEditShiftSubmitting(true)
    try {
      await shifts.edit(editShiftLoadedId, {
        employeeName,
        clockInDate: toIsoDateString(editShiftForm.clockInDate),
        clockInTime: toIsoTimeString(editShiftForm.clockInTime),
        clockOutDate: hasClockOutDate ? toIsoDateString(editShiftForm.clockOutDate) : undefined,
        clockOutTime: hasClockOutTime ? toIsoTimeString(editShiftForm.clockOutTime) : undefined,
        isSupervisor: editShiftForm.isSupervisor,
        payRateOverride: editShiftForm.payRateOverride || undefined,
      })
      setEditShiftSuccess(`Shift updated for ${employeeName}.`)
      timesheet.getAll().then((d) => setEntries(d.entries)).catch(() => setEntries([]))
    } catch (err) {
      setEditShiftError(err instanceof Error ? err.message : 'Failed to update shift.')
    } finally {
      setEditShiftSubmitting(false)
    }
  }

  async function handleDeleteShiftSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setDeleteShiftError('')
    setDeleteShiftSuccess('')

    const entryId = deleteShiftEntryId.trim()
    if (!entryId) {
      setDeleteShiftError('Please enter an Entry ID to delete.')
      return
    }

    if (!window.confirm(`Delete entry ${entryId}? This cannot be undone.`)) {
      return
    }

    setDeleteShiftSubmitting(true)
    try {
      await shifts.delete(entryId)
      setDeleteShiftSuccess(`Deleted entry ${entryId}.`)
      setDeleteShiftEntryId('')
      timesheet.getAll().then((d) => setEntries(d.entries)).catch(() => setEntries([]))
    } catch (err) {
      setDeleteShiftError(err instanceof Error ? err.message : 'Failed to delete shift.')
    } finally {
      setDeleteShiftSubmitting(false)
    }
  }

  async function handleCreateUserSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setCreateUserError('')
    setCreateUserSuccess('')

    const username = createUserForm.username.trim()
    const displayName = createUserForm.displayName.trim()
    const password = createUserForm.password
    const role =
      user?.role === 'admin'
        ? createUserForm.role
        : createUserForm.role === 'admin'
          ? 'manager'
          : createUserForm.role

    if (!username) {
      setCreateUserError('Username is required.')
      return
    }
    if (!displayName) {
      setCreateUserError('Display name is required.')
      return
    }
    if (!password) {
      setCreateUserError('Password is required.')
      return
    }

    setCreateUserSubmitting(true)
    try {
      await users.create({ username, password, displayName, role })
      setCreateUserSuccess(`Created user ${displayName}.`)
      setCreateUserForm(DEFAULT_CREATE_USER_FORM)
      users.list().then((d) => setUserList(d.users)).catch(() => setUserList([]))
    } catch (err) {
      setCreateUserError(err instanceof Error ? err.message : 'Failed to create user.')
    } finally {
      setCreateUserSubmitting(false)
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
          <h3>Create New User</h3>
          <form onSubmit={handleCreateUserSubmit}>
            <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
              <label>
                Username:
                <input
                  type="text"
                  value={createUserForm.username}
                  onChange={(e) => setCreateUserForm((prev) => ({ ...prev, username: e.target.value }))}
                  placeholder="Username"
                  autoComplete="off"
                />
              </label>
              <label>
                Display Name:
                <input
                  type="text"
                  value={createUserForm.displayName}
                  onChange={(e) => setCreateUserForm((prev) => ({ ...prev, displayName: e.target.value }))}
                  placeholder="Display name"
                  autoComplete="off"
                />
              </label>
              <label>
                Password:
                <input
                  type="password"
                  value={createUserForm.password}
                  onChange={(e) => setCreateUserForm((prev) => ({ ...prev, password: e.target.value }))}
                  placeholder="Password"
                  autoComplete="new-password"
                />
              </label>
              <label>
                Role:
                <select
                  value={createUserForm.role}
                  onChange={(e) =>
                    setCreateUserForm((prev) => ({
                      ...prev,
                      role: e.target.value as CreateUserFormState['role'],
                    }))
                  }
                >
                  <option value="employee">employee</option>
                  <option value="manager">manager</option>
                  {user?.role === 'admin' && <option value="admin">admin</option>}
                </select>
              </label>
            </div>
            {createUserError && <p className="error">{createUserError}</p>}
            {createUserSuccess && <p className="success">{createUserSuccess}</p>}
            <div className="btn-row">
              <button type="submit" className="btn-primary" disabled={createUserSubmitting}>
                {createUserSubmitting ? 'Creating...' : 'Create User'}
              </button>
            </div>
          </form>

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
      {tab === 'edit' && (
        <div className="card">
          <h3>Edit Shift</h3>
          <p className="info">
            Copy an Entry ID from the View All Entries tab, then load it here to edit that shift.
          </p>
          <form onSubmit={handleEditShiftLoad}>
            <label>
              Enter Entry ID to edit:
              <input
                type="text"
                value={editShiftEntryId}
                onChange={(e) => setEditShiftEntryId(e.target.value)}
                placeholder="Paste Entry ID here..."
              />
            </label>
            {editShiftLookupError && <p className="error">{editShiftLookupError}</p>}
            {editShiftLookupSuccess && <p className="success">{editShiftLookupSuccess}</p>}
            <div className="btn-row">
              <button type="submit" className="btn-secondary" disabled={editShiftLoading}>
                {editShiftLoading ? 'Loading...' : 'Load Shift'}
              </button>
            </div>
          </form>
          {editShiftLoadedId && (
            <form onSubmit={handleEditShiftSubmit}>
              <h4>Edit Shift Details</h4>
              <label>
                Employee Name:
                <input
                  type="text"
                  value={editShiftForm.employeeName}
                  onChange={(e) => setEditShiftForm((prev) => ({ ...prev, employeeName: e.target.value }))}
                  placeholder="Employee name"
                />
              </label>
              <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
                <label>
                  Clock-In Date:
                  <input
                    type="date"
                    value={editShiftForm.clockInDate}
                    onChange={(e) => setEditShiftForm((prev) => ({ ...prev, clockInDate: e.target.value }))}
                    required
                  />
                </label>
                <label>
                  Clock-In Time:
                  <input
                    type="time"
                    value={editShiftForm.clockInTime}
                    onChange={(e) => setEditShiftForm((prev) => ({ ...prev, clockInTime: e.target.value }))}
                    required
                  />
                </label>
                <label>
                  Clock-Out Date (optional):
                  <input
                    type="date"
                    value={editShiftForm.clockOutDate}
                    onChange={(e) => setEditShiftForm((prev) => ({ ...prev, clockOutDate: e.target.value }))}
                  />
                </label>
                <label>
                  Clock-Out Time (optional):
                  <input
                    type="time"
                    value={editShiftForm.clockOutTime}
                    onChange={(e) => setEditShiftForm((prev) => ({ ...prev, clockOutTime: e.target.value }))}
                  />
                </label>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem' }}>
                <input
                  type="checkbox"
                  checked={editShiftForm.isSupervisor}
                  onChange={(e) => setEditShiftForm((prev) => ({ ...prev, isSupervisor: e.target.checked }))}
                  style={{ width: 'auto' }}
                />
                Supervisor Role
              </label>
              <label>
                Pay Rate Override:
                <select
                  value={editShiftForm.payRateOverride}
                  onChange={(e) =>
                    setEditShiftForm((prev) => ({
                      ...prev,
                      payRateOverride: e.target.value as EditShiftFormState['payRateOverride'],
                    }))
                  }
                >
                <option value="">Auto-calculate</option>
                <option value="Standard">Standard</option>
                <option value="Enhanced">Enhanced</option>
                <option value="Supervisor">Supervisor</option>
              </select>
            </label>
              {editShiftError && <p className="error">{editShiftError}</p>}
              {editShiftSuccess && <p className="success">{editShiftSuccess}</p>}
              <div className="btn-row">
                <button type="submit" className="btn-primary" disabled={editShiftSubmitting}>
                  {editShiftSubmitting ? 'Updating...' : 'Update Shift'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
      {tab === 'delete' && (
        <div className="card">
          <h3>Delete Entry</h3>
          <p className="info">Copy an Entry ID from the View All Entries tab, then delete it here.</p>
          <form onSubmit={handleDeleteShiftSubmit}>
            <label>
              Enter Entry ID to delete:
              <input
                type="text"
                value={deleteShiftEntryId}
                onChange={(e) => setDeleteShiftEntryId(e.target.value)}
                placeholder="Paste Entry ID here..."
              />
            </label>
            {deleteShiftError && <p className="error">{deleteShiftError}</p>}
            {deleteShiftSuccess && <p className="success">{deleteShiftSuccess}</p>}
            <div className="btn-row">
              <button type="submit" className="btn-secondary" disabled={deleteShiftSubmitting}>
                {deleteShiftSubmitting ? 'Deleting...' : 'Delete Entry'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
