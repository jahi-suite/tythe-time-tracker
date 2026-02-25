import type { TimeEntry, PayRateType, TimeSplit, VenueSettings } from '../../shared/types.js'
import { DB } from '../../shared/constants.js'
import * as repo from '../db/repository.js'
import { logChange } from '../audit.js'
import { getVenueSettings } from '../auth/index.js'
import { getHourInBst, convertToUtc } from '../utils/timeUtils.js'

function isEnhancedHour(hour: number, venueSettings?: VenueSettings | null): boolean {
  const settings = venueSettings ?? null
  if (settings && !settings.enhanced_enabled) return false
  const startHour = settings?.enhanced_start_hour ?? 19
  const endHour = settings?.enhanced_end_hour ?? 4
  if (startHour === endHour) return true
  if (startHour < endHour) return hour >= startHour && hour < endHour
  return hour >= startHour || hour < endHour
}

function determinePayRateType(
  isSupervisor: boolean,
  clockIn?: Date,
  venueSettings?: VenueSettings | null
): PayRateType {
  if (isSupervisor) return 'Supervisor'
  const time = clockIn ?? new Date()
  const hour = getHourInBst(time)
  if (isEnhancedHour(hour, venueSettings)) return 'Enhanced'
  return 'Standard'
}

function timeEntryToAudit(entry: TimeEntry): Record<string, unknown> {
  return {
    id: entry.id,
    user_id: entry.user_id,
    employee: entry.employee,
    clock_in: entry.clock_in.toISOString(),
    clock_out: entry.clock_out?.toISOString() ?? null,
    pay_rate_type: entry.pay_rate_type,
    created_at: entry.created_at.toISOString(),
  }
}

export async function clockIn(
  employeeName: string,
  isSupervisor: boolean,
  userId?: string | null,
  venueId?: string | null
): Promise<[boolean, string]> {
  const existing = userId
    ? await repo.getOpenShiftByUserId(userId, employeeName, venueId)
    : await repo.getOpenShift(employeeName, venueId)
  if (existing) return [false, `${employeeName} already has an open shift`]
  const venueSettings = await getVenueSettings(venueId)
  const payRateType = determinePayRateType(isSupervisor, undefined, venueSettings)
  await repo.createTimeEntry(employeeName, new Date(), payRateType, null, userId, venueId)
  return [true, `${employeeName} clocked in successfully (${payRateType} Rate)`]
}

export async function clockOut(
  employeeName: string,
  userId?: string | null,
  venueId?: string | null
): Promise<[boolean, string]> {
  const openShift = userId
    ? await repo.getOpenShiftByUserId(userId, employeeName, venueId)
    : await repo.getOpenShift(employeeName, venueId)
  if (!openShift) return [false, `No open shift found for ${employeeName}`]
  await repo.closeShift(openShift.id, new Date(), venueId)
  return [true, `${employeeName} clocked out successfully`]
}

export async function getOpenShift(
  employeeName: string,
  userId?: string | null,
  venueId?: string | null
): Promise<TimeEntry | null> {
  if (userId) return repo.getOpenShiftByUserId(userId, employeeName, venueId)
  return repo.getOpenShift(employeeName, venueId)
}

export async function getEmployeeTimesheet(
  employee: string,
  startDate?: Date | null,
  endDate?: Date | null,
  userId?: string | null,
  venueId?: string | null
): Promise<TimeEntry[]> {
  if (userId) return repo.getEmployeeTimesheetByUserId(userId, employee, startDate, endDate, venueId)
  return repo.getEmployeeTimesheet(employee, startDate, endDate, venueId)
}

export async function getAllTimesheets(
  startDate?: Date | null,
  endDate?: Date | null,
  venueId?: string | null
): Promise<TimeEntry[]> {
  return repo.getAllTimesheets(startDate, endDate, venueId)
}

export async function addShift(
  employeeName: string,
  clockInDate: Date,
  clockInTime: Date,
  clockOutDate: Date | null,
  clockOutTime: Date | null,
  isSupervisor: boolean,
  payRateOverride: PayRateType | null,
  auditUsername: string,
  venueId?: string | null
): Promise<[boolean, string]> {
  const clockInUtc = convertToUtc(
    clockInDate.getFullYear(),
    clockInDate.getMonth() + 1,
    clockInDate.getDate(),
    clockInTime.getHours(),
    clockInTime.getMinutes()
  )
  let clockOutUtc: Date | null = null
  if (clockOutDate && clockOutTime) {
    clockOutUtc = convertToUtc(
      clockOutDate.getFullYear(),
      clockOutDate.getMonth() + 1,
      clockOutDate.getDate(),
      clockOutTime.getHours(),
      clockOutTime.getMinutes()
    )
  }
  const venueSettings = await getVenueSettings(venueId)
  const payRateType = payRateOverride ?? determinePayRateType(isSupervisor, clockInUtc, venueSettings)
  const entry = await repo.createTimeEntry(employeeName, clockInUtc, payRateType, clockOutUtc, null, venueId)
  await logChange('add', DB.TIME_ENTRIES_TABLE, entry.id, auditUsername, undefined, timeEntryToAudit(entry), venueId)
  return [true, `Shift added for ${employeeName} (${payRateType} Rate)`]
}

export async function editShift(
  entryId: string,
  employeeName: string,
  clockInDate: Date,
  clockInTime: Date,
  clockOutDate: Date | null,
  clockOutTime: Date | null,
  isSupervisor: boolean,
  payRateOverride: PayRateType | null,
  auditUsername: string,
  venueId?: string | null
): Promise<[boolean, string]> {
  const existing = await repo.getTimeEntryById(entryId, venueId)
  if (!existing) return [false, 'Shift not found']
  const clockInUtc = convertToUtc(
    clockInDate.getFullYear(),
    clockInDate.getMonth() + 1,
    clockInDate.getDate(),
    clockInTime.getHours(),
    clockInTime.getMinutes()
  )
  let clockOutUtc: Date | null = null
  if (clockOutDate && clockOutTime) {
    clockOutUtc = convertToUtc(
      clockOutDate.getFullYear(),
      clockOutDate.getMonth() + 1,
      clockOutDate.getDate(),
      clockOutTime.getHours(),
      clockOutTime.getMinutes()
    )
  }
  const venueSettings = await getVenueSettings(venueId)
  const payRateType = payRateOverride ?? determinePayRateType(isSupervisor, clockInUtc, venueSettings)
  const updated = await repo.updateTimeEntry(
    entryId,
    employeeName,
    clockInUtc,
    clockOutUtc,
    payRateType,
    venueId
  )
  await logChange('edit', DB.TIME_ENTRIES_TABLE, updated.id, auditUsername, timeEntryToAudit(existing), timeEntryToAudit(updated), venueId)
  return [true, `Shift updated for ${employeeName} (${payRateType} Rate)`]
}

export async function deleteEntry(
  entryId: string,
  auditUsername: string,
  venueId?: string | null
): Promise<[boolean, string]> {
  const existing = await repo.getTimeEntryById(entryId, venueId)
  if (!existing) return [false, 'Entry not found']
  const deleted = await repo.deleteTimeEntry(entryId, venueId)
  if (deleted) {
    await logChange('delete', DB.TIME_ENTRIES_TABLE, existing.id, auditUsername, timeEntryToAudit(existing), undefined, venueId)
    return [true, 'Entry deleted successfully']
  }
  return [false, 'Entry not found']
}

export async function getShiftById(
  entryId: string,
  venueId?: string | null
): Promise<TimeEntry | null> {
  return repo.getTimeEntryById(entryId, venueId)
}

export function calculateTimeSplit(entry: TimeEntry, venueSettings?: VenueSettings | null): TimeSplit {
  if (!entry.clock_out) return { standard_hours: 0, enhanced_hours: 0, supervisor_hours: 0 }
  const totalHours = (entry.clock_out.getTime() - entry.clock_in.getTime()) / (1000 * 3600)
  if (entry.pay_rate_type === 'Supervisor') {
    return { standard_hours: 0, enhanced_hours: 0, supervisor_hours: Math.round(totalHours * 100) / 100 }
  }
  const hour = getHourInBst(entry.clock_in)
  if (isEnhancedHour(hour, venueSettings)) {
    return { standard_hours: 0, enhanced_hours: Math.round(totalHours * 100) / 100, supervisor_hours: 0 }
  }
  return { standard_hours: Math.round(totalHours * 100) / 100, enhanced_hours: 0, supervisor_hours: 0 }
}
