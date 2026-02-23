import { DateTime } from 'luxon'
import { TIME } from '../../shared/constants.js'

const UK_TZ = 'Europe/London'

/** Convert UTC Date to UK local (GMT/BST) - returns Date with same moment for display */
export function convertToBst(utcTime: Date): Date {
  const dt = DateTime.fromJSDate(utcTime, { zone: 'utc' }).setZone(UK_TZ)
  return dt.toJSDate()
}

/** Convert UK local date (from form) to UTC. Pass date parts to avoid server timezone issues. */
export function convertToUtc(year: number, month: number, day: number, hour: number, minute: number): Date {
  const dt = DateTime.fromObject({ year, month, day, hour, minute }, { zone: UK_TZ })
  return dt.toUTC().toJSDate()
}

/** Get hour in BST for a UTC date */
export function getHourInBst(utcDate: Date): number {
  const dt = DateTime.fromJSDate(utcDate, { zone: 'utc' }).setZone(UK_TZ)
  return dt.hour
}

/** Check if clock-in is during enhanced hours (7PM–4AM BST) */
export function isEnhancedHours(clockIn: Date): boolean {
  const hour = getHourInBst(clockIn)
  return hour >= TIME.ENHANCED_START_HOUR || hour < TIME.ENHANCED_END_HOUR
}

export function formatInBst(date: Date, fmt: string): string {
  return DateTime.fromJSDate(date, { zone: 'utc' }).setZone(UK_TZ).toFormat(fmt)
}

export function getCurrentUtc(): Date {
  return new Date()
}
