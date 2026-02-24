import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { exportExcelUrl, exportPdfUrl } from '../api'

export function ExportPage() {
  const { user } = useAuth()
  const displayName = user?.display_name || user?.username || 'User'
  const isManager = user?.role === 'manager' || user?.role === 'admin'
  const [employee, setEmployee] = useState('')
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')

  const excelUrl = exportExcelUrl(
    isManager && employee ? employee : undefined,
    start || undefined,
    end || undefined
  )
  const pdfUrl = exportPdfUrl(
    isManager && employee ? employee : undefined,
    start || undefined,
    end || undefined
  )
  const accessLabel = isManager ? 'Manager' : 'Employee'
  const scopeLabel = isManager ? (employee ? 'Single Employee' : 'Whole Team') : 'Self Only'
  const filterStatus = start || end || employee ? 'Filtered' : 'No Filters'

  return (
    <div className="page page-dashboard export-dashboard">
      <h2>Export Timesheet</h2>
      <div className="card">
        <div className="user-card-badges">
          <span className={`badge ${isManager ? 'badge-role-manager' : 'badge-role-employee'}`}>{accessLabel}</span>
          <span className={`badge ${filterStatus === 'Filtered' ? 'badge-status-active' : 'badge-status-inactive'}`}>
            {filterStatus}
          </span>
        </div>
        {isManager ? (
          <p className="message-success">Manager Export Access — You can export timesheets for any employee or the entire team.</p>
        ) : (
          <p className="message-info">Employee Export Access — You can only export your own timesheet.</p>
        )}
      </div>
      <div className="stat-cards">
        <div className="stat-card">
          <span className="stat-value">{accessLabel}</span>
          <span className="stat-label">Access</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{scopeLabel}</span>
          <span className="stat-label">Export Scope</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{start ? 'Set' : 'Any'}</span>
          <span className="stat-label">Start Date</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{end ? 'Set' : 'Any'}</span>
          <span className="stat-label">End Date</span>
        </div>
      </div>
      <div className="cards-grid">
        <div className="card">
          <h3>Filters</h3>
          <div className="export-filter-grid">
            {isManager ? (
              <label>
                Employee (optional, leave blank for all):
                <input
                  type="text"
                  value={employee}
                  onChange={(e) => setEmployee(e.target.value)}
                  placeholder="Employee name"
                />
              </label>
            ) : null}
            <label>
              Start date:
              <input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
            </label>
            <label>
              End date:
              <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
            </label>
          </div>
        </div>
        <div className="card export-download-card">
          <h3>Download</h3>
          <p>
            <span className="badge">Excel</span>{' '}
            <span className="badge">PDF</span>
          </p>
          <p className="message-info">
            Export {isManager ? (employee ? `for ${employee}` : 'for all employees') : 'your timesheet'}
            {start || end ? ' using the selected date range.' : ' with the current date filter settings.'}
          </p>
          <div className="btn-row export-download-actions">
            <a href={excelUrl} download className="btn-primary">
              Download Excel
            </a>
            <a href={pdfUrl} download className="btn-secondary">
              Download PDF
            </a>
          </div>
        </div>
      </div>
      <div className="card">
        <h3>Current Selection</h3>
        <p><strong>Employee:</strong> {isManager ? (employee || 'All employees') : displayName}</p>
        <p><strong>Start date:</strong> {start || 'Any'}</p>
        <p><strong>End date:</strong> {end || 'Any'}</p>
        <p><strong>Formats:</strong> Excel, PDF</p>
      </div>
    </div>
  )
}
