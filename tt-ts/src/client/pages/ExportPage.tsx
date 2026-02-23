import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { exportExcelUrl, exportPdfUrl } from '../api'

export function ExportPage() {
  const { user } = useAuth()
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

  return (
    <div className="page">
      <h2>Export Timesheet</h2>
      <div className="card">
        {isManager ? (
          <p className="success">Manager Export Access — You can export timesheets for any employee or the entire team.</p>
        ) : (
          <p className="info">Employee Export Access — You can only export your own timesheet.</p>
        )}
      </div>
      <div className="card">
        {isManager ? (
          <>
            <label>
              Employee (optional, leave blank for all):
              <input
                type="text"
                value={employee}
                onChange={(e) => setEmployee(e.target.value)}
                placeholder="Employee name"
              />
            </label>
          </>
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
      <div className="card">
        <h3>Download</h3>
        <div className="btn-row">
          <a href={excelUrl} download className="btn-primary" style={{ textDecoration: 'none' }}>
            Download Excel
          </a>
          <a href={pdfUrl} download className="btn-secondary" style={{ textDecoration: 'none' }}>
            Download PDF
          </a>
        </div>
      </div>
    </div>
  )
}
