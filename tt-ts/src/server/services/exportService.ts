import ExcelJS from 'exceljs'
import PDFDocument from 'pdfkit'
import type { TimeEntry } from '../../shared/types.js'
import { convertToBst } from '../utils/timeUtils.js'
import {
  applyBreakDeduction,
  splitShiftByRate,
  calculateStaffSummary,
  formatPay,
  getStaffSummaryKey,
  type UserRatesMap,
} from './exportUtils.js'
import { getAllUsers, getVenueSettings } from '../auth/index.js'

async function getUserRatesMap(): Promise<UserRatesMap> {
  const users = await getAllUsers()
  const map: UserRatesMap = { byUserId: {}, byDisplayName: {} }
  for (const u of users) {
    const rates = {
      standard_rate: u.standard_rate ?? null,
      enhanced_rate: u.enhanced_rate ?? null,
      supervisor_rate: u.supervisor_rate ?? null,
    }
    if (u.id) map.byUserId[u.id] = rates
    const key = (u.display_name ?? '').trim().toLowerCase()
    if (key) map.byDisplayName[key] = rates
  }
  return map
}

export async function exportToExcel(
  entries: TimeEntry[],
  startDate?: Date | null,
  endDate?: Date | null,
  venueId?: string | null
): Promise<Buffer> {
  const breakDeductionNote =
    'Hours and pay shown are ALREADY net of the 20-minute unpaid break for shifts of 6+ hours. Do not deduct break again.'
  if (entries.length === 0) {
    const wb = new ExcelJS.Workbook()
    const ws = wb.addWorksheet('Staff Hours & Shifts')
    ws.addRow(['No entries'])
    ws.addRow([])
    ws.addRow(['Note', breakDeductionNote])
    return Buffer.from(await wb.xlsx.writeBuffer())
  }

  const userRatesMap = await getUserRatesMap()
  const venueSettings = await getVenueSettings(venueId)
  const staffSummary = calculateStaffSummary(entries, userRatesMap, venueSettings)
  const sortedEntries = [...entries].sort(
    (a, b) =>
      a.employee.toLowerCase().localeCompare(b.employee.toLowerCase()) ||
      a.clock_in.getTime() - b.clock_in.getTime()
  )

  const wb = new ExcelJS.Workbook()
  const ws = wb.addWorksheet('Staff Hours & Shifts', { views: [{ state: 'frozen', ySplit: 1 }] })

  const headers = [
    'Staff Name',
    'Date',
    'Clock-In',
    'Clock-Out',
    'Standard Hours',
    'Enhanced Hours',
    'Supervisor Hours',
    'Total Hours (net of break)',
    'Break Deducted',
    'Total Shifts',
    'Pay Rate Type',
    'Supervisor Flag',
    'Standard Pay',
    'Enhanced Pay',
    'Supervisor Pay',
    'Total Pay',
  ]
  ws.addRow(headers)
  ws.columns = [
    { width: 22 }, // Staff Name
    { width: 12 }, // Date
    { width: 10 }, // Clock-In
    { width: 10 }, // Clock-Out
    { width: 12 }, // Standard Hours
    { width: 12 }, // Enhanced Hours
    { width: 14 }, // Supervisor Hours
    { width: 24 }, // Total Hours (net of break)
    { width: 14 }, // Break Deducted
    { width: 12 }, // Total Shifts
    { width: 34 }, // Pay Rate Type
    { width: 15 }, // Supervisor Flag
    { width: 12 }, // Standard Pay
    { width: 12 }, // Enhanced Pay
    { width: 13 }, // Supervisor Pay
    { width: 12 }, // Total Pay
  ]
  const staffHeaderRow = ws.getRow(1)
  staffHeaderRow.eachCell((cell) => {
    cell.font = { bold: true, size: 11, color: { argb: 'FFFFFFFF' } }
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF2F5496' },
    }
    cell.border = {
      top: { style: 'medium' as const, color: { argb: 'FF2F5496' } },
      left: { style: 'thin' as const, color: { argb: 'FF2F5496' } },
      bottom: { style: 'medium' as const, color: { argb: 'FF2F5496' } },
      right: { style: 'thin' as const, color: { argb: 'FF2F5496' } },
    }
    cell.alignment = { wrapText: true, vertical: 'middle' as const }
  })
  const staffTableBorder = {
    top: { style: 'thin' as const, color: { argb: 'FF7F7F7F' } },
    left: { style: 'thin' as const, color: { argb: 'FF7F7F7F' } },
    bottom: { style: 'thin' as const, color: { argb: 'FF7F7F7F' } },
    right: { style: 'thin' as const, color: { argb: 'FF7F7F7F' } },
  }
  const totalsRowFill = {
    type: 'pattern' as const,
    pattern: 'solid' as const,
    fgColor: { argb: 'FFE7E6E6' },
  }

  for (const [summaryKey, data] of Object.entries(staffSummary)) {
    const employee = data.employee_label
    const totalsRow = ws.addRow([
      `📊 ${employee} - TOTALS`,
      '',
      '',
      '',
      data.Standard,
      data.Enhanced,
      data.Supervisor,
      data.total_hours,
      '',
      data.total_shifts,
      '',
      '',
      formatPay(data.standard_pay),
      formatPay(data.enhanced_pay),
      formatPay(data.supervisor_pay),
      formatPay(data.total_pay),
    ])
    totalsRow.eachCell((cell) => {
      cell.fill = totalsRowFill
      cell.font = { bold: true }
    })

    let employeeShiftRowIndex = 0
    for (const entry of sortedEntries) {
      if (getStaffSummaryKey(entry) !== summaryKey) continue
      const isSupervisor = entry.pay_rate_type === 'Supervisor'
      const grossSplit = splitShiftByRate(entry.clock_in, entry.clock_out, isSupervisor, venueSettings)
      const split = applyBreakDeduction(grossSplit, venueSettings)
      const grossHours = grossSplit.Standard + grossSplit.Enhanced + grossSplit.Supervisor
      const breakDeducted = grossHours >= 6 ? '20 min' : '—'
      const bstIn = convertToBst(entry.clock_in)
      const bstOut = entry.clock_out ? convertToBst(entry.clock_out) : null
      let shiftDisplay: string
      if (isSupervisor) {
        shiftDisplay = `Supervisor (${split.Supervisor}h)`
      } else if (split.Standard > 0 && split.Enhanced > 0) {
        shiftDisplay = `Mixed: ${split.Standard}h Standard, ${split.Enhanced}h Enhanced`
      } else if (split.Enhanced > 0) {
        shiftDisplay = `Enhanced (${split.Enhanced}h)`
      } else {
        shiftDisplay = `Standard (${split.Standard}h)`
      }
      const shiftRow = ws.addRow([
        `  └─ ${employee}`,
        bstIn.toISOString().slice(0, 10),
        bstIn.toTimeString().slice(0, 8),
        bstOut ? bstOut.toTimeString().slice(0, 8) : 'In Progress',
        split.Standard,
        split.Enhanced,
        split.Supervisor,
        split.Standard + split.Enhanced + split.Supervisor,
        breakDeducted,
        '',
        shiftDisplay,
        isSupervisor ? 'Yes' : 'No',
        '—',
        '—',
        '—',
        '—',
      ])
      employeeShiftRowIndex += 1
      if (employeeShiftRowIndex % 2 === 0) {
        shiftRow.eachCell({ includeEmpty: true }, (cell, columnNumber) => {
          if (columnNumber <= headers.length) {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFFAFAFA' },
            }
          }
        })
      }
    }
    ws.addRow([])
  }
  ws.addRow(['Note', breakDeductionNote])

  for (let rowNumber = 1; rowNumber <= ws.rowCount; rowNumber++) {
    const row = ws.getRow(rowNumber)
    let hasContent = false
    for (let columnNumber = 1; columnNumber <= headers.length; columnNumber++) {
      const value = row.getCell(columnNumber).value
      if (value !== null && value !== undefined && value !== '') {
        hasContent = true
        break
      }
    }
    if (!hasContent) continue

    for (let columnNumber = 1; columnNumber <= headers.length; columnNumber++) {
      ws.getCell(rowNumber, columnNumber).border = staffTableBorder
    }
  }

  const summaryWs = wb.addWorksheet('Overall Summary')
  const overall = Object.values(staffSummary).reduce(
    (acc, d) => ({
      hours: acc.hours + d.total_hours,
      shifts: acc.shifts + d.total_shifts,
    }),
    { hours: 0, shifts: 0 }
  )
  summaryWs.addRow(['Metric', 'Value'])
  summaryWs.columns = [
    { width: 28 },
    { width: 48 },
  ]
  const summaryHeaderRow = summaryWs.getRow(1)
  summaryHeaderRow.eachCell((cell) => {
    cell.font = { bold: true, size: 11, color: { argb: 'FFFFFFFF' } }
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF2F5496' },
    }
    cell.border = {
      top: { style: 'medium' as const, color: { argb: 'FF2F5496' } },
      left: { style: 'thin' as const, color: { argb: 'FF2F5496' } },
      bottom: { style: 'medium' as const, color: { argb: 'FF2F5496' } },
      right: { style: 'thin' as const, color: { argb: 'FF2F5496' } },
    }
  })
  summaryWs.addRow(['Total Hours (net of break)', overall.hours])
  summaryWs.addRow(['Total Shifts', overall.shifts])
  summaryWs.addRow(['Unique Employees', Object.keys(staffSummary).length])
  if (startDate && endDate) {
    summaryWs.addRow(['Date Range', `${startDate.toISOString().slice(0, 10)} to ${endDate.toISOString().slice(0, 10)}`])
  }
  summaryWs.addRow([])
  summaryWs.addRow(['Note', breakDeductionNote])

  for (let rowNumber = 1; rowNumber <= summaryWs.rowCount; rowNumber++) {
    const row = summaryWs.getRow(rowNumber)
    let hasContent = false
    for (let columnNumber = 1; columnNumber <= 2; columnNumber++) {
      const value = row.getCell(columnNumber).value
      if (value !== null && value !== undefined && value !== '') {
        hasContent = true
        break
      }
    }
    if (!hasContent) continue

    for (let columnNumber = 1; columnNumber <= 2; columnNumber++) {
      summaryWs.getCell(rowNumber, columnNumber).border = staffTableBorder
    }
  }

  return Buffer.from(await wb.xlsx.writeBuffer())
}

export async function exportToPdf(entries: TimeEntry[], venueId?: string | null): Promise<Buffer> {
  const chunks: Buffer[] = []
  const doc = new PDFDocument({ margin: 50 })

  doc.on('data', (chunk: Buffer) => chunks.push(chunk))

  if (entries.length === 0) {
    doc.fontSize(12).text('No entries', 50, 50)
    doc.end()
    return new Promise((resolve) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)))
    })
  }

  const userRatesMap = await getUserRatesMap()
  const venueSettings = await getVenueSettings(venueId)
  const staffSummary = calculateStaffSummary(entries, userRatesMap, venueSettings)
  const sortedEntries = [...entries].sort(
    (a, b) =>
      a.employee.toLowerCase().localeCompare(b.employee.toLowerCase()) ||
      a.clock_in.getTime() - b.clock_in.getTime()
  )

  const overall = Object.values(staffSummary).reduce(
    (acc, d) => ({
      hours: acc.hours + d.total_hours,
      shifts: acc.shifts + d.total_shifts,
    }),
    { hours: 0, shifts: 0 }
  )

  doc.fontSize(14).text('Overall Summary:', 50, 50)
  doc.fontSize(10).text(`Total Hours: ${overall.hours}`, 50, 70)
  doc.text(`Total Shifts: ${overall.shifts}`, 50, 85)
  doc.text(`Unique Employees: ${Object.keys(staffSummary).length}`, 50, 100)
  let y = 130

  for (const [summaryKey, data] of Object.entries(staffSummary)) {
    const employee = data.employee_label
    doc.fontSize(12).text(`${employee} - TOTALS`, 50, y)
    y += 20
    doc.fontSize(9).text(
      `Standard: ${data.Standard}h | Enhanced: ${data.Enhanced}h | Supervisor: ${data.Supervisor}h | Total: ${data.total_hours}h | Shifts: ${data.total_shifts}`,
      50,
      y
    )
    if (data.total_pay != null) {
      doc.text(`Pay: ${formatPay(data.total_pay)}`, 50, y + 15)
      y += 15
    }
    y += 25

    for (const entry of sortedEntries) {
      if (getStaffSummaryKey(entry) !== summaryKey) continue
      const isSupervisor = entry.pay_rate_type === 'Supervisor'
      const split = applyBreakDeduction(
        splitShiftByRate(entry.clock_in, entry.clock_out, isSupervisor, venueSettings),
        venueSettings
      )
      const bstIn = convertToBst(entry.clock_in)
      const bstOut = entry.clock_out ? convertToBst(entry.clock_out) : null
      let shiftDisplay: string
      if (isSupervisor) {
        shiftDisplay = `Supervisor (${split.Supervisor}h)`
      } else if (split.Standard > 0 && split.Enhanced > 0) {
        shiftDisplay = `Mixed: ${split.Standard}h Std, ${split.Enhanced}h Enh`
      } else if (split.Enhanced > 0) {
        shiftDisplay = `Enhanced (${split.Enhanced}h)`
      } else {
        shiftDisplay = `Standard (${split.Standard}h)`
      }
      doc.fontSize(9).text(
        `${bstIn.toISOString().slice(0, 10)} ${bstIn.toTimeString().slice(0, 5)} - ${bstOut ? bstOut.toTimeString().slice(0, 5) : 'In Progress'} | ${shiftDisplay}`,
        60,
        y
      )
      y += 15
    }
    y += 20
  }

  doc.end()
  return new Promise((resolve) => {
    doc.on('end', () => resolve(Buffer.concat(chunks)))
  })
}
