import type { TimeEntry, VenueSettings } from '../../shared/types.js'
import { convertToBst } from '../utils/timeUtils.js'

export interface ShiftSplit {
  Standard: number
  Enhanced: number
  Supervisor: number
}

export function splitShiftByRate(
  clockIn: Date,
  clockOut: Date | null,
  isSupervisor: boolean,
  venueSettings?: VenueSettings | null
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
  if (venueSettings && !venueSettings.enhanced_enabled) {
    const total = (bstOutMs - bstInMs) / (1000 * 3600)
    return { Standard: Math.round(total * 100) / 100, Enhanced: 0, Supervisor: 0 }
  }

  const dayMs = 24 * 60 * 60 * 1000
  const bstInDate = new Date(bstIn.getFullYear(), bstIn.getMonth(), bstIn.getDate())
  const bstOutDate = new Date(bstOut.getFullYear(), bstOut.getMonth(), bstOut.getDate())
  const startHour = venueSettings?.enhanced_start_hour ?? 19
  const endHour = venueSettings?.enhanced_end_hour ?? 4
  const totalHours = (bstOutMs - bstInMs) / (1000 * 3600)
  if (startHour === endHour) {
    return { Standard: 0, Enhanced: Math.round(totalHours * 100) / 100, Supervisor: 0 }
  }

  let enhancedMs = 0
  for (
    let cursorDay = bstInDate.getTime() - dayMs;
    cursorDay <= bstOutDate.getTime();
    cursorDay += dayMs
  ) {
    const windowStart = new Date(cursorDay)
    windowStart.setHours(startHour, 0, 0, 0)
    const windowEnd = new Date(cursorDay)
    if (startHour < endHour) {
      windowEnd.setHours(endHour, 0, 0, 0)
    } else {
      windowEnd.setTime(cursorDay + dayMs)
      windowEnd.setHours(endHour, 0, 0, 0)
    }
    const enhStart = Math.max(bstInMs, windowStart.getTime())
    const enhEnd = Math.min(bstOutMs, windowEnd.getTime())
    if (enhStart < enhEnd) enhancedMs += enhEnd - enhStart
  }

  const enhancedHours = Math.max(enhancedMs / (1000 * 3600), 0)
  const standardHours = totalHours - enhancedHours

  return {
    Standard: Math.round(standardHours * 100) / 100,
    Enhanced: Math.round(enhancedHours * 100) / 100,
    Supervisor: 0,
  }
}

export function applyBreakDeduction(
  split: ShiftSplit,
  _venueSettings?: VenueSettings | null
): ShiftSplit {
  const adjusted: ShiftSplit = {
    Standard: Math.round((Number(split.Standard) || 0) * 100) / 100,
    Enhanced: Math.round((Number(split.Enhanced) || 0) * 100) / 100,
    Supervisor: Math.round((Number(split.Supervisor) || 0) * 100) / 100,
  }

  const totalHours = adjusted.Standard + adjusted.Enhanced + adjusted.Supervisor
  if (totalHours < 6) return adjusted

  const breakHours = 20 / 60
  const order: Array<keyof ShiftSplit> = ['Standard', 'Enhanced', 'Supervisor']
  let majority: keyof ShiftSplit = 'Standard'
  let maxHours = adjusted.Standard

  for (const key of order.slice(1)) {
    if (adjusted[key] > maxHours) {
      majority = key
      maxHours = adjusted[key]
    }
  }

  adjusted[majority] = Math.max(0, adjusted[majority] - Math.min(adjusted[majority], breakHours))

  return {
    Standard: Math.round(adjusted.Standard * 100) / 100,
    Enhanced: Math.round(adjusted.Enhanced * 100) / 100,
    Supervisor: Math.round(adjusted.Supervisor * 100) / 100,
  }
}

export interface StaffSummaryData {
  employee_label: string
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
  byUserId: Record<
    string,
    {
      standard_rate: number | null
      enhanced_rate: number | null
      supervisor_rate: number | null
    }
  >
  byDisplayName: Record<
    string,
    {
      standard_rate: number | null
      enhanced_rate: number | null
      supervisor_rate: number | null
    }
  >
}

export function getStaffSummaryKey(entry: TimeEntry): string {
  if (entry.user_id) return `user:${entry.user_id}`
  return `name:${entry.employee.trim().toLowerCase()}`
}

export function calculateStaffSummary(
  entries: TimeEntry[],
  userRatesMap?: UserRatesMap,
  venueSettings?: VenueSettings | null
): Record<string, StaffSummaryData> {
  const staffSummary: Record<string, StaffSummaryData> = {}
  for (const entry of entries) {
    const isSupervisor = entry.pay_rate_type === 'Supervisor'
    const split = applyBreakDeduction(
      splitShiftByRate(entry.clock_in, entry.clock_out, isSupervisor, venueSettings),
      venueSettings
    )
    const emp = entry.employee
    const key = getStaffSummaryKey(entry)
    if (!staffSummary[key]) {
      staffSummary[key] = {
        employee_label: emp,
        Standard: 0,
        Enhanced: 0,
        Supervisor: 0,
        total_hours: 0,
        total_shifts: 0,
      }
    }
    staffSummary[key].Standard += split.Standard
    staffSummary[key].Enhanced += split.Enhanced
    staffSummary[key].Supervisor += split.Supervisor
    staffSummary[key].total_hours += split.Standard + split.Enhanced + split.Supervisor
    staffSummary[key].total_shifts += 1
  }

  if (userRatesMap) {
    for (const entry of entries) {
      const data = staffSummary[getStaffSummaryKey(entry)]
      if (!data) continue
      const rates =
        (entry.user_id ? userRatesMap.byUserId[entry.user_id] : undefined) ??
        userRatesMap.byDisplayName[entry.employee.trim().toLowerCase()]
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
