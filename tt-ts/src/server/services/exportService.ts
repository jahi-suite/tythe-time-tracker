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
  const staffHeaderRow = ws.getRow(1)
  staffHeaderRow.eachCell((cell) => {
    cell.font = { bold: true, size: 11 }
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF2F2F2' },
    }
    cell.border = {
      bottom: { style: 'thin', color: { argb: 'FFBFBFBF' } },
    }
  })

  for (const [summaryKey, data] of Object.entries(staffSummary)) {
    const employee = data.employee_label
    ws.addRow([
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
      ws.addRow([
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
    }
    ws.addRow([])
  }
  ws.addRow(['Note', breakDeductionNote])

  const summaryWs = wb.addWorksheet('Overall Summary')
  const overall = Object.values(staffSummary).reduce(
    (acc, d) => ({
      hours: acc.hours + d.total_hours,
      shifts: acc.shifts + d.total_shifts,
    }),
    { hours: 0, shifts: 0 }
  )
  summaryWs.addRow(['Metric', 'Value'])
  summaryWs.addRow(['Total Hours (net of break)', overall.hours])
  summaryWs.addRow(['Total Shifts', overall.shifts])
  summaryWs.addRow(['Unique Employees', Object.keys(staffSummary).length])
  if (startDate && endDate) {
    summaryWs.addRow(['Date Range', `${startDate.toISOString().slice(0, 10)} to ${endDate.toISOString().slice(0, 10)}`])
  }
  summaryWs.addRow([])
  summaryWs.addRow(['Note', breakDeductionNote])

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
