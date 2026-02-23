import type { TimeEntry } from '../../shared/types.js'
import { convertToBst } from '../utils/timeUtils.js'

export interface ShiftSplit {
  Standard: number
  Enhanced: number
  Supervisor: number
}

export function splitShiftByRate(
  clockIn: Date,
  clockOut: Date | null,
  isSupervisor: boolean
): ShiftSplit {
  if (!clockOut) return { Standard: 0, Enhanced: 0, Supervisor: 0 }
  if (isSupervisor) {
    const total = (clockOut.getTime() - clockIn.getTime()) / (1000 * 3600)
    return { Standard: 0, Enhanced: 0, Supervisor: Math.round(total * 100) / 100 }
  }
  const bstIn = convertToBst(clockIn)
  const bstOut = convertToBst(clockOut)
  const bstInMs = bstIn.getTime()
  const bstOutMs = bstOut.getTime()
  if (bstOutMs <= bstInMs) return { Standard: 0, Enhanced: 0, Supervisor: 0 }

  const dayMs = 24 * 60 * 60 * 1000
  const bstInDate = new Date(bstIn.getFullYear(), bstIn.getMonth(), bstIn.getDate())
  const bstOutDate = new Date(bstOut.getFullYear(), bstOut.getMonth(), bstOut.getDate())

  let enhancedStart: Date
  let enhancedEnd: Date
  if (bstIn.getHours() < 4) {
    enhancedStart = new Date(bstInDate.getTime() - dayMs)
    enhancedStart.setHours(19, 0, 0, 0)
    enhancedEnd = new Date(bstInDate.getTime())
    enhancedEnd.setHours(4, 0, 0, 0)
  } else {
    enhancedStart = new Date(bstInDate.getTime())
    enhancedStart.setHours(19, 0, 0, 0)
    enhancedEnd = new Date(bstInDate.getTime() + dayMs)
    enhancedEnd.setHours(4, 0, 0, 0)
  }

  const enhStart = Math.max(bstInMs, enhancedStart.getTime())
  const enhEnd = Math.min(bstOutMs, enhancedEnd.getTime())
  const enhancedHours =
    enhStart < enhEnd ? Math.max((enhEnd - enhStart) / (1000 * 3600), 0) : 0
  const totalHours = (bstOutMs - bstInMs) / (1000 * 3600)
  const standardHours = totalHours - enhancedHours

  return {
    Standard: Math.round(standardHours * 100) / 100,
    Enhanced: Math.round(enhancedHours * 100) / 100,
    Supervisor: 0,
  }
}

export interface StaffSummaryData {
  Standard: number
  Enhanced: number
  Supervisor: number
  total_hours: number
  total_shifts: number
  standard_pay?: number
  enhanced_pay?: number
  supervisor_pay?: number
  total_pay?: number
}

export interface UserRatesMap {
  [displayName: string]: {
    standard_rate: number | null
    enhanced_rate: number | null
    supervisor_rate: number | null
  }
}

export function calculateStaffSummary(
  entries: TimeEntry[],
  userRatesMap?: UserRatesMap
): Record<string, StaffSummaryData> {
  const staffSummary: Record<string, StaffSummaryData> = {}
  for (const entry of entries) {
    const isSupervisor = entry.pay_rate_type === 'Supervisor'
    const split = splitShiftByRate(entry.clock_in, entry.clock_out, isSupervisor)
    const emp = entry.employee
    if (!staffSummary[emp]) {
      staffSummary[emp] = {
        Standard: 0,
        Enhanced: 0,
        Supervisor: 0,
        total_hours: 0,
        total_shifts: 0,
      }
    }
    staffSummary[emp].Standard += split.Standard
    staffSummary[emp].Enhanced += split.Enhanced
    staffSummary[emp].Supervisor += split.Supervisor
    staffSummary[emp].total_hours += split.Standard + split.Enhanced + split.Supervisor
    staffSummary[emp].total_shifts += 1
  }

  if (userRatesMap) {
    for (const emp of Object.keys(staffSummary)) {
      const data = staffSummary[emp]
      const rates = userRatesMap[emp.trim().toLowerCase()]
      if (rates) {
        data.standard_pay =
          rates.standard_rate != null ? Math.round(data.Standard * rates.standard_rate * 100) / 100 : undefined
        data.enhanced_pay =
          rates.enhanced_rate != null ? Math.round(data.Enhanced * rates.enhanced_rate * 100) / 100 : undefined
        data.supervisor_pay =
          rates.supervisor_rate != null ? Math.round(data.Supervisor * rates.supervisor_rate * 100) / 100 : undefined
        const total =
          (data.standard_pay ?? 0) + (data.enhanced_pay ?? 0) + (data.supervisor_pay ?? 0)
        data.total_pay = total > 0 ? Math.round(total * 100) / 100 : undefined
      }
    }
  }
  return staffSummary
}

export function formatPay(amount: number | null | undefined): string {
  if (amount == null || amount === 0) return '—'
  return `£${amount.toFixed(2)}`
}

export function getDateRange(option: string): { start: Date; end: Date } | null {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const day = 24 * 60 * 60 * 1000

  if (option === 'This Week') {
    const weekday = today.getDay()
    const mondayOffset = weekday === 0 ? -6 : 1 - weekday
    const start = new Date(today)
    start.setDate(today.getDate() + mondayOffset)
    const end = new Date(start)
    end.setDate(start.getDate() + 6)
    return { start, end }
  }
  if (option === 'Last Week') {
    const weekday = today.getDay()
    const mondayOffset = weekday === 0 ? -6 : 1 - weekday
    const start = new Date(today)
    start.setDate(today.getDate() + mondayOffset - 7)
    const end = new Date(start)
    end.setDate(start.getDate() + 6)
    return { start, end }
  }
  if (option === 'This Month') {
    const start = new Date(today.getFullYear(), today.getMonth(), 1)
    const end = new Date(today.getFullYear(), today.getMonth() + 1, 0)
    return { start, end }
  }
  return null
}
