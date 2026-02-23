import type { TimeEntry, PayRateType, AuditLogEntry } from '../../shared/types.js'
import { DB } from '../../shared/constants.js'

type TimeEntryRow = {
  id: string
  user_id: string | null
  employee: string
  clock_in: Date
  clock_out: Date | null
  pay_rate_type: string
  created_at: Date
}

function rowToTimeEntry(row: {
  id: string
  user_id: string | null
  employee: string
  clock_in: Date
  clock_out: Date | null
  pay_rate_type: string
  created_at: Date
}): TimeEntry {
  return {
    id: row.id,
    user_id: row.user_id ?? null,
    employee: row.employee,
    clock_in: new Date(row.clock_in),
    clock_out: row.clock_out ? new Date(row.clock_out) : null,
    pay_rate_type: row.pay_rate_type as PayRateType,
    created_at: new Date(row.created_at),
  }
}

export async function createTimeEntry(
  employee: string,
  clockIn: Date,
  payRateType: PayRateType,
  clockOut?: Date | null,
  userId?: string | null
): Promise<TimeEntry> {
  const { query } = await import('./connection.js')
  const res = await query<TimeEntryRow>(
    `INSERT INTO ${DB.TIME_ENTRIES_TABLE} 
     (${DB.USER_ID_COLUMN}, ${DB.EMPLOYEE_COLUMN}, ${DB.CLOCK_IN_COLUMN}, ${DB.CLOCK_OUT_COLUMN}, ${DB.PAY_RATE_TYPE_COLUMN})
     VALUES ($1, $2, $3, $4, $5)
     RETURNING ${DB.ID_COLUMN}, ${DB.USER_ID_COLUMN}, ${DB.EMPLOYEE_COLUMN}, ${DB.CLOCK_IN_COLUMN}, ${DB.CLOCK_OUT_COLUMN}, ${DB.PAY_RATE_TYPE_COLUMN}, ${DB.CREATED_AT_COLUMN}`,
    [userId ?? null, employee.trim(), clockIn, clockOut ?? null, payRateType]
  )
  return rowToTimeEntry(res.rows[0])
}

export async function getOpenShift(employee: string): Promise<TimeEntry | null> {
  const { query } = await import('./connection.js')
  const res = await query<TimeEntryRow>(
    `SELECT ${DB.ID_COLUMN}, ${DB.USER_ID_COLUMN}, ${DB.EMPLOYEE_COLUMN}, ${DB.CLOCK_IN_COLUMN}, ${DB.CLOCK_OUT_COLUMN}, ${DB.PAY_RATE_TYPE_COLUMN}, ${DB.CREATED_AT_COLUMN}
     FROM ${DB.TIME_ENTRIES_TABLE}
     WHERE LOWER(${DB.EMPLOYEE_COLUMN}) = LOWER($1) AND ${DB.CLOCK_OUT_COLUMN} IS NULL
     ORDER BY ${DB.CLOCK_IN_COLUMN} DESC LIMIT 1`,
    [employee.trim()]
  )
  return res.rows[0] ? rowToTimeEntry(res.rows[0]) : null
}

export async function getOpenShiftByUserId(
  userId: string,
  fallbackEmployee?: string | null
): Promise<TimeEntry | null> {
  const { query } = await import('./connection.js')
  const params: unknown[] = [userId]
  let sql = `SELECT ${DB.ID_COLUMN}, ${DB.USER_ID_COLUMN}, ${DB.EMPLOYEE_COLUMN}, ${DB.CLOCK_IN_COLUMN}, ${DB.CLOCK_OUT_COLUMN}, ${DB.PAY_RATE_TYPE_COLUMN}, ${DB.CREATED_AT_COLUMN}
     FROM ${DB.TIME_ENTRIES_TABLE}
     WHERE ${DB.USER_ID_COLUMN} = $1 AND ${DB.CLOCK_OUT_COLUMN} IS NULL`
  if (fallbackEmployee?.trim()) {
    params.push(fallbackEmployee.trim())
    sql += ` OR (${DB.USER_ID_COLUMN} IS NULL AND LOWER(${DB.EMPLOYEE_COLUMN}) = LOWER($${params.length}) AND ${DB.CLOCK_OUT_COLUMN} IS NULL)`
  }
  sql += ` ORDER BY ${DB.CLOCK_IN_COLUMN} DESC LIMIT 1`
  const res = await query<TimeEntryRow>(sql, params)
  return res.rows[0] ? rowToTimeEntry(res.rows[0]) : null
}

export async function closeShift(entryId: string, clockOut: Date): Promise<TimeEntry> {
  const { query } = await import('./connection.js')
  const res = await query<TimeEntryRow>(
    `UPDATE ${DB.TIME_ENTRIES_TABLE} SET ${DB.CLOCK_OUT_COLUMN} = $1 WHERE ${DB.ID_COLUMN} = $2
     RETURNING ${DB.ID_COLUMN}, ${DB.USER_ID_COLUMN}, ${DB.EMPLOYEE_COLUMN}, ${DB.CLOCK_IN_COLUMN}, ${DB.CLOCK_OUT_COLUMN}, ${DB.PAY_RATE_TYPE_COLUMN}, ${DB.CREATED_AT_COLUMN}`,
    [clockOut, entryId]
  )
  if (!res.rows[0]) throw new Error(`Time entry ${entryId} not found`)
  return rowToTimeEntry(res.rows[0])
}

export async function getEmployeeTimesheet(
  employee: string,
  startDate?: Date | null,
  endDate?: Date | null
): Promise<TimeEntry[]> {
  const { query } = await import('./connection.js')
  let sql = `SELECT ${DB.ID_COLUMN}, ${DB.USER_ID_COLUMN}, ${DB.EMPLOYEE_COLUMN}, ${DB.CLOCK_IN_COLUMN}, ${DB.CLOCK_OUT_COLUMN}, ${DB.PAY_RATE_TYPE_COLUMN}, ${DB.CREATED_AT_COLUMN}
     FROM ${DB.TIME_ENTRIES_TABLE} WHERE LOWER(${DB.EMPLOYEE_COLUMN}) = LOWER($1)`
  const params: unknown[] = [employee.trim()]
  if (startDate) {
    params.push(startDate)
    sql += ` AND DATE(${DB.CLOCK_IN_COLUMN}) >= $${params.length}`
  }
  if (endDate) {
    params.push(endDate)
    sql += ` AND DATE(${DB.CLOCK_IN_COLUMN}) <= $${params.length}`
  }
  sql += ` ORDER BY ${DB.CLOCK_IN_COLUMN} DESC`
  const res = await query<TimeEntryRow>(sql, params)
  return res.rows.map(rowToTimeEntry)
}

export async function getEmployeeTimesheetByUserId(
  userId: string,
  fallbackEmployee?: string | null,
  startDate?: Date | null,
  endDate?: Date | null
): Promise<TimeEntry[]> {
  const { query } = await import('./connection.js')
  const params: unknown[] = [userId]
  let sql = `SELECT ${DB.ID_COLUMN}, ${DB.USER_ID_COLUMN}, ${DB.EMPLOYEE_COLUMN}, ${DB.CLOCK_IN_COLUMN}, ${DB.CLOCK_OUT_COLUMN}, ${DB.PAY_RATE_TYPE_COLUMN}, ${DB.CREATED_AT_COLUMN}
     FROM ${DB.TIME_ENTRIES_TABLE}
     WHERE (${DB.USER_ID_COLUMN} = $1`
  if (fallbackEmployee?.trim()) {
    params.push(fallbackEmployee.trim())
    sql += ` OR (${DB.USER_ID_COLUMN} IS NULL AND LOWER(${DB.EMPLOYEE_COLUMN}) = LOWER($${params.length}))`
  }
  sql += `)`
  if (startDate) {
    params.push(startDate)
    sql += ` AND DATE(${DB.CLOCK_IN_COLUMN}) >= $${params.length}`
  }
  if (endDate) {
    params.push(endDate)
    sql += ` AND DATE(${DB.CLOCK_IN_COLUMN}) <= $${params.length}`
  }
  sql += ` ORDER BY ${DB.CLOCK_IN_COLUMN} DESC`
  const res = await query<TimeEntryRow>(sql, params)
  return res.rows.map(rowToTimeEntry)
}

export async function getAllTimesheets(
  startDate?: Date | null,
  endDate?: Date | null
): Promise<TimeEntry[]> {
  const { query } = await import('./connection.js')
  let sql = `SELECT ${DB.ID_COLUMN}, ${DB.USER_ID_COLUMN}, ${DB.EMPLOYEE_COLUMN}, ${DB.CLOCK_IN_COLUMN}, ${DB.CLOCK_OUT_COLUMN}, ${DB.PAY_RATE_TYPE_COLUMN}, ${DB.CREATED_AT_COLUMN}
     FROM ${DB.TIME_ENTRIES_TABLE} WHERE 1=1`
  const params: unknown[] = []
  if (startDate) {
    params.push(startDate)
    sql += ` AND DATE(${DB.CLOCK_IN_COLUMN}) >= $${params.length}`
  }
  if (endDate) {
    params.push(endDate)
    sql += ` AND DATE(${DB.CLOCK_IN_COLUMN}) <= $${params.length}`
  }
  sql += ` ORDER BY ${DB.CLOCK_IN_COLUMN} DESC`
  const res = await query<TimeEntryRow>(sql, params)
  return res.rows.map(rowToTimeEntry)
}

export async function getTimeEntryById(entryId: string): Promise<TimeEntry | null> {
  const { query } = await import('./connection.js')
  const res = await query<TimeEntryRow>(
    `SELECT ${DB.ID_COLUMN}, ${DB.USER_ID_COLUMN}, ${DB.EMPLOYEE_COLUMN}, ${DB.CLOCK_IN_COLUMN}, ${DB.CLOCK_OUT_COLUMN}, ${DB.PAY_RATE_TYPE_COLUMN}, ${DB.CREATED_AT_COLUMN}
     FROM ${DB.TIME_ENTRIES_TABLE} WHERE ${DB.ID_COLUMN} = $1`,
    [entryId]
  )
  return res.rows[0] ? rowToTimeEntry(res.rows[0]) : null
}

export async function updateTimeEntry(
  entryId: string,
  employee: string,
  clockIn: Date,
  clockOut: Date | null,
  payRateType: PayRateType
): Promise<TimeEntry> {
  const { query } = await import('./connection.js')
  const res = await query<TimeEntryRow>(
    `UPDATE ${DB.TIME_ENTRIES_TABLE}
     SET ${DB.EMPLOYEE_COLUMN} = $1, ${DB.CLOCK_IN_COLUMN} = $2, ${DB.CLOCK_OUT_COLUMN} = $3, ${DB.PAY_RATE_TYPE_COLUMN} = $4
     WHERE ${DB.ID_COLUMN} = $5
     RETURNING ${DB.ID_COLUMN}, ${DB.USER_ID_COLUMN}, ${DB.EMPLOYEE_COLUMN}, ${DB.CLOCK_IN_COLUMN}, ${DB.CLOCK_OUT_COLUMN}, ${DB.PAY_RATE_TYPE_COLUMN}, ${DB.CREATED_AT_COLUMN}`,
    [employee.trim(), clockIn, clockOut, payRateType, entryId]
  )
  if (!res.rows[0]) throw new Error(`Time entry ${entryId} not found`)
  return rowToTimeEntry(res.rows[0])
}

export async function deleteTimeEntry(entryId: string): Promise<boolean> {
  const { query } = await import('./connection.js')
  const res = await query(
    `DELETE FROM ${DB.TIME_ENTRIES_TABLE} WHERE ${DB.ID_COLUMN} = $1`,
    [entryId]
  )
  return (res.rowCount ?? 0) > 0
}

export async function insertAuditLog(
  action: 'add' | 'edit' | 'delete',
  targetTable: string,
  targetId: string | null,
  changedBy: string,
  oldValues?: Record<string, unknown> | null,
  newValues?: Record<string, unknown> | null
): Promise<{ id: string; created_at: Date }> {
  const { query } = await import('./connection.js')
  const res = await query<{ id: string; created_at: Date }>(
    `INSERT INTO ${DB.AUDIT_LOG_TABLE} (action, target_table, target_id, changed_by, old_values, new_values)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, created_at`,
    [action, targetTable, targetId, changedBy.trim(), oldValues ? JSON.stringify(oldValues) : null, newValues ? JSON.stringify(newValues) : null]
  )
  return res.rows[0]
}

export async function getAuditLogs(filters?: {
  action?: string
  target_table?: string
  changed_by?: string
  start_date?: Date
  end_date?: Date
  limit?: number
}): Promise<AuditLogEntry[]> {
  const { query } = await import('./connection.js')
  let sql = `SELECT id, action, target_table, target_id, changed_by, old_values, new_values, created_at
     FROM ${DB.AUDIT_LOG_TABLE} WHERE 1=1`
  const params: unknown[] = []
  if (filters?.action) {
    params.push(filters.action)
    sql += ` AND action = $${params.length}`
  }
  if (filters?.target_table) {
    params.push(filters.target_table)
    sql += ` AND target_table = $${params.length}`
  }
  if (filters?.changed_by) {
    params.push(filters.changed_by)
    sql += ` AND changed_by = $${params.length}`
  }
  if (filters?.start_date) {
    params.push(filters.start_date)
    sql += ` AND created_at >= $${params.length}`
  }
  if (filters?.end_date) {
    params.push(filters.end_date)
    sql += ` AND created_at <= $${params.length}`
  }
  sql += ' ORDER BY created_at DESC'
  if (filters?.limit) {
    params.push(filters.limit)
    sql += ` LIMIT $${params.length}`
  }
  const res = await query<{
    id: string
    action: 'add' | 'edit' | 'delete'
    target_table: string
    target_id: string | null
    changed_by: string
    old_values: unknown
    new_values: unknown
    created_at: Date
  }>(sql, params)
  return res.rows.map((r) => ({
    id: r.id,
    action: r.action,
    target_table: r.target_table,
    target_id: r.target_id,
    changed_by: r.changed_by,
    old_values: r.old_values as Record<string, unknown> | null,
    new_values: r.new_values as Record<string, unknown> | null,
    created_at: new Date(r.created_at),
  }))
}
