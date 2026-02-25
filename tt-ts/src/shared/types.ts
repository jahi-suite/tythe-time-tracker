/**
 * Shared types for Tythe Time Tracker (TypeScript migration).
 */

export type PayRateType = 'Standard' | 'Enhanced' | 'Supervisor'
export type UserRole = 'employee' | 'manager' | 'admin'

export interface TimeEntry {
  id: string
  user_id: string | null
  employee: string
  clock_in: Date
  clock_out: Date | null
  pay_rate_type: PayRateType
  created_at: Date
}

export interface User {
  id: string
  username: string
  role: UserRole
  display_name: string
  active?: boolean
  standard_rate?: number | null
  enhanced_rate?: number | null
  supervisor_rate?: number | null
}

export interface AuthUser {
  id: string
  username: string
  role: UserRole
  display_name: string
}

export interface VenueSettings {
  enhanced_enabled: boolean
  enhanced_start_hour: number
  enhanced_end_hour: number
  break_deduct_enabled: boolean
  break_deduct_minutes: number
  break_threshold_hours: number
}

export interface TimeSplit {
  standard_hours: number
  enhanced_hours: number
  supervisor_hours: number
}

export interface StaffSummary {
  employee: string
  standard_hours: number
  enhanced_hours: number
  supervisor_hours: number
  total_shifts: number
}

export interface AuditLogEntry {
  id: string
  action: 'add' | 'edit' | 'delete'
  target_table: string
  target_id: string | null
  changed_by: string
  old_values: Record<string, unknown> | null
  new_values: Record<string, unknown> | null
  created_at: Date
}
