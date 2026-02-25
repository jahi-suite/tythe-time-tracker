/**
 * Constants for Tythe Time Tracker.
 */

export const DB = {
  VENUES_TABLE: 'venues',
  TIME_ENTRIES_TABLE: 'time_entries',
  USERS_TABLE: 'users',
  AUDIT_LOG_TABLE: 'audit_log',
  ID_COLUMN: 'id',
  VENUE_ID_COLUMN: 'venue_id',
  USER_ID_COLUMN: 'user_id',
  EMPLOYEE_COLUMN: 'employee',
  CLOCK_IN_COLUMN: 'clock_in',
  CLOCK_OUT_COLUMN: 'clock_out',
  PAY_RATE_TYPE_COLUMN: 'pay_rate_type',
  CREATED_AT_COLUMN: 'created_at',
  USERNAME_COLUMN: 'username',
  PASSWORD_HASH_COLUMN: 'password_hash',
  ROLE_COLUMN: 'role',
  DISPLAY_NAME_COLUMN: 'display_name',
  ACTIVE_COLUMN: 'active',
  STANDARD_RATE_COLUMN: 'standard_rate',
  ENHANCED_RATE_COLUMN: 'enhanced_rate',
  SUPERVISOR_RATE_COLUMN: 'supervisor_rate',
  DEFAULT_PAY_RATE: 'Standard',
} as const

export const TIME = {
  ENHANCED_START_HOUR: 19, // 7 PM BST
  ENHANCED_END_HOUR: 4,    // 4 AM BST
  HOURS_PRECISION: 2,
} as const

export const ALLOWED_ROLES = ['employee', 'manager', 'admin'] as const
