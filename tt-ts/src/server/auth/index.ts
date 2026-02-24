import bcrypt from 'bcrypt'
import type { AuthUser, User } from '../../shared/types.js'
import { DB, ALLOWED_ROLES } from '../../shared/constants.js'
import { query } from '../db/connection.js'

const MAX_PAY_RATE = 999.99

function isValidPayRateValue(value: number | null): boolean {
  if (value === null) return true
  if (typeof value !== 'number' || !Number.isFinite(value)) return false
  if (value < 0 || value > MAX_PAY_RATE) return false
  return Math.abs(value - Math.round(value * 100) / 100) <= 1e-9
}

export function hashPassword(plain: string): string {
  return bcrypt.hashSync(plain, bcrypt.genSaltSync())
}

export function verifyPassword(plain: string, hashed: string): boolean {
  return bcrypt.compareSync(plain, hashed)
}

export async function authenticateUser(username: string, password: string): Promise<AuthUser | null> {
  const res = await query<{
    id: string
    username: string
    password_hash: string
    role: string
    display_name: string
  }>(
    `SELECT id, username, password_hash, role, display_name
     FROM ${DB.USERS_TABLE}
     WHERE username = $1 AND active = true`,
    [username.trim()]
  )
  const row = res.rows[0]
  if (!row || !verifyPassword(password, row.password_hash)) return null
  return {
    id: row.id,
    username: row.username,
    role: row.role as AuthUser['role'],
    display_name: row.display_name,
  }
}

export async function getAuthUserById(id: string): Promise<AuthUser | null> {
  const res = await query<{
    id: string
    username: string
    role: string
    display_name: string
  }>(
    `SELECT id, username, role, display_name
     FROM ${DB.USERS_TABLE}
     WHERE id = $1 AND active = true`,
    [id]
  )
  const row = res.rows[0]
  if (!row) return null
  if (!row.display_name?.trim() && !row.username?.trim()) return null
  return {
    id: row.id,
    username: row.username,
    role: row.role as AuthUser['role'],
    display_name: row.display_name,
  }
}

export async function createUser(
  username: string,
  password: string,
  displayName: string,
  role: string
): Promise<[boolean, string]> {
  if (!username.trim() || !password || !displayName.trim()) {
    return [false, 'Username, password, and display name are required.']
  }
  if (!ALLOWED_ROLES.includes(role as (typeof ALLOWED_ROLES)[number])) {
    return [false, "Role must be 'employee', 'manager', or 'admin'."]
  }
  try {
    const hash = hashPassword(password)
    await query(
      `INSERT INTO ${DB.USERS_TABLE} (username, password_hash, role, display_name)
       VALUES ($1, $2, $3, $4)`,
      [username.trim(), hash, role, displayName.trim()]
    )
    return [true, `User '${username.trim()}' created successfully.`]
  } catch (e: unknown) {
    const msg = String(e)
    if (msg.toLowerCase().includes('unique') || msg.toLowerCase().includes('duplicate')) {
      return [false, `Username '${username.trim()}' is already taken.`]
    }
    return [false, `Failed to create user: ${msg}`]
  }
}

export async function getAllUsers(): Promise<User[]> {
  const res = await query<{
    id: string
    username: string
    role: string
    display_name: string
    active: boolean
    standard_rate: number | null
    enhanced_rate: number | null
    supervisor_rate: number | null
  }>(
    `SELECT id, username, role, display_name, active,
            ${DB.STANDARD_RATE_COLUMN}, ${DB.ENHANCED_RATE_COLUMN}, ${DB.SUPERVISOR_RATE_COLUMN}
     FROM ${DB.USERS_TABLE}
     ORDER BY role, display_name`
  )
  return res.rows.map((r) => ({
    id: r.id,
    username: r.username,
    role: r.role as User['role'],
    display_name: r.display_name,
    active: r.active,
    standard_rate: r.standard_rate,
    enhanced_rate: r.enhanced_rate,
    supervisor_rate: r.supervisor_rate,
  }))
}

export async function getUserPayRates(displayName: string): Promise<{
  standard_rate: number | null
  enhanced_rate: number | null
  supervisor_rate: number | null
} | null> {
  const name = displayName?.trim() ?? ''
  if (!name) return null
  const res = await query<{
    standard_rate: number | null
    enhanced_rate: number | null
    supervisor_rate: number | null
  }>(
    `SELECT ${DB.STANDARD_RATE_COLUMN}, ${DB.ENHANCED_RATE_COLUMN}, ${DB.SUPERVISOR_RATE_COLUMN}
     FROM ${DB.USERS_TABLE}
     WHERE LOWER(TRIM(${DB.DISPLAY_NAME_COLUMN})) = LOWER($1)`,
    [name]
  )
  const row = res.rows[0]
  if (!row) return null
  return {
    standard_rate: row.standard_rate,
    enhanced_rate: row.enhanced_rate,
    supervisor_rate: row.supervisor_rate,
  }
}

export async function setUserPayRates(
  userId: string,
  standard: number | null,
  enhanced: number | null,
  supervisor: number | null
): Promise<[boolean, string]> {
  if (!isValidPayRateValue(standard) || !isValidPayRateValue(enhanced) || !isValidPayRateValue(supervisor)) {
    return [false, `Pay rates must be null or numbers between 0 and ${MAX_PAY_RATE} with up to 2 decimals.`]
  }
  try {
    const res = await query(
      `UPDATE ${DB.USERS_TABLE}
       SET ${DB.STANDARD_RATE_COLUMN} = $1, ${DB.ENHANCED_RATE_COLUMN} = $2, ${DB.SUPERVISOR_RATE_COLUMN} = $3
       WHERE id = $4`,
      [standard, enhanced, supervisor, userId]
    )
    if (res.rowCount === 0) return [false, 'User not found.']
    return [true, 'Pay rates updated successfully.']
  } catch (e: unknown) {
    return [false, `Failed to update pay rates: ${e}`]
  }
}

export async function setUserActive(userId: string, active: boolean): Promise<[boolean, string]> {
  try {
    const res = await query(
      `UPDATE ${DB.USERS_TABLE} SET ${DB.ACTIVE_COLUMN} = $1 WHERE id = $2`,
      [active, userId]
    )
    if (res.rowCount === 0) return [false, 'User not found.']
    return [true, `User ${active ? 'activated' : 'deactivated'} successfully.`]
  } catch (e: unknown) {
    return [false, `Failed to update user: ${e}`]
  }
}

export async function updateUser(
  userId: string,
  username: string,
  displayName: string,
  role: string,
  password?: string | null,
  currentUserId?: string | null
): Promise<[boolean, string]> {
  if (currentUserId && userId === currentUserId) {
    return [false, 'You cannot edit your own account here.']
  }
  if (!username.trim() || !displayName.trim()) {
    return [false, 'Username and display name are required.']
  }
  if (!ALLOWED_ROLES.includes(role as (typeof ALLOWED_ROLES)[number])) {
    return [false, "Role must be 'employee', 'manager', or 'admin'."]
  }
  try {
    let sql = `UPDATE ${DB.USERS_TABLE} SET username = $1, display_name = $2, role = $3`
    const params: unknown[] = [username.trim(), displayName.trim(), role]
    if (password) {
      params.push(hashPassword(password))
      sql += `, password_hash = $${params.length}`
    }
    params.push(userId)
    sql += ` WHERE id = $${params.length}`
    const res = await query(sql, params)
    if (res.rowCount === 0) return [false, 'User not found.']
    return [true, 'User updated successfully.']
  } catch (e: unknown) {
    const msg = String(e)
    if (msg.toLowerCase().includes('unique') || msg.toLowerCase().includes('duplicate')) {
      return [false, `Username '${username.trim()}' is already taken.`]
    }
    return [false, `Failed to update user: ${msg}`]
  }
}

export async function deleteUser(userId: string, currentUserId?: string | null): Promise<[boolean, string]> {
  if (currentUserId && userId === currentUserId) {
    return [false, 'You cannot delete your own account.']
  }
  try {
    const res = await query(`DELETE FROM ${DB.USERS_TABLE} WHERE id = $1`, [userId])
    if (res.rowCount === 0) return [false, 'User not found.']
    return [true, 'User deleted successfully.']
  } catch (e: unknown) {
    return [false, `Failed to delete user: ${e}`]
  }
}

export function isAdminOrManager(user: AuthUser | null): boolean {
  if (!user) return false
  return user.role === 'manager' || user.role === 'admin'
}

export async function countAdmins(): Promise<number> {
  const res = await query<{ count: string }>(
    `SELECT COUNT(*) FROM ${DB.USERS_TABLE} WHERE role = 'admin'`
  )
  return parseInt(res.rows[0]?.count ?? '0', 10)
}

async function getUserForAuth(userId: string): Promise<{
  id: string
  username: string
  password_hash: string
  role: string
  display_name: string
  active: boolean
} | null> {
  const res = await query<{
    id: string
    username: string
    password_hash: string
    role: string
    display_name: string
    active: boolean
  }>(
    `SELECT id, username, password_hash, role, display_name, active
     FROM ${DB.USERS_TABLE} WHERE id = $1`,
    [userId]
  )
  return res.rows[0] ?? null
}

export async function changePasswordSelf(
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<[boolean, string]> {
  if (!userId?.trim()) return [false, 'User ID is required.']
  if (!currentPassword) return [false, 'Current password is required.']
  if (!newPassword) return [false, 'New password is required.']
  const user = await getUserForAuth(userId)
  if (!user) return [false, 'User not found.']
  if (!user.active) return [false, 'User account is inactive.']
  if (!verifyPassword(currentPassword, user.password_hash)) {
    return [false, 'Current password is incorrect.']
  }
  await query(
    `UPDATE ${DB.USERS_TABLE} SET password_hash = $1 WHERE id = $2`,
    [hashPassword(newPassword), userId]
  )
  return [true, 'Password changed successfully.']
}

export async function changePasswordForUser(
  actor: AuthUser,
  targetUserId: string,
  newPassword: string
): Promise<[boolean, string]> {
  if (!targetUserId) return [false, 'Target user is required.']
  if (!newPassword) return [false, 'New password is required.']
  if (actor.role !== 'manager' && actor.role !== 'admin') {
    return [false, 'Only managers or admins can reset passwords.']
  }
  const target = await getUserForAuth(targetUserId)
  if (!target) return [false, 'User not found.']
  if (actor.role === 'manager' && target.role !== 'employee') {
    return [false, 'Managers can only reset employee passwords.']
  }
  await query(
    `UPDATE ${DB.USERS_TABLE} SET password_hash = $1 WHERE id = $2`,
    [hashPassword(newPassword), targetUserId]
  )
  return [true, 'Password reset successfully.']
}

export async function isUsersTableEmpty(): Promise<boolean> {
  const res = await query<{ count: string }>(`SELECT COUNT(*) FROM ${DB.USERS_TABLE}`)
  return parseInt(res.rows[0]?.count ?? '0', 10) === 0
}

export async function createFirstManager(
  username: string,
  password: string,
  displayName: string
): Promise<[boolean, string]> {
  if (!(await isUsersTableEmpty())) {
    return [false, 'An admin account already exists. Please log in.']
  }
  return createUser(username, password, displayName, 'manager')
}

export async function promoteToAdmin(actor: AuthUser, targetUserId: string): Promise<[boolean, string]> {
  const target = await getUserForAuth(targetUserId)
  if (!target) return [false, 'User not found.']
  if (target.role === 'admin') return [false, 'User is already an admin.']
  if (target.role !== 'manager') return [false, 'Only managers can be promoted to admin.']

  const adminCount = await countAdmins()
  const allowed =
    actor.role === 'admin' ||
    (adminCount === 0 && actor.role === 'manager' && actor.id === targetUserId)
  if (adminCount === 0 && actor.role === 'manager' && actor.id !== targetUserId) {
    return [false, 'When no admins exist, a manager may only promote themselves.']
  }
  if (!allowed) return [false, 'Only admins can promote a user to admin.']

  await query(`UPDATE ${DB.USERS_TABLE} SET role = 'admin' WHERE id = $1`, [targetUserId])
  return [true, 'User promoted to admin successfully.']
}
