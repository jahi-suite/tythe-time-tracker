import { Router } from 'express'
import * as auth from '../auth/index.js'
import { logChange } from '../audit.js'
import { requireAdmin, requireManager } from '../middleware/auth.js'
import { createIpRateLimit } from '../middleware/rateLimit.js'
import type { User } from '../../shared/types.js'
import { DB } from '../../shared/constants.js'

const router = Router()
const MAX_PAY_RATE = 999.99

function parsePayRateInput(value: unknown, label: string): number | null {
  if (value === undefined || value === null || value === '') return null
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new Error(`${label} must be a number or null`)
  }
  if (value < 0) {
    throw new Error(`${label} cannot be negative`)
  }
  if (value > MAX_PAY_RATE) {
    throw new Error(`${label} must be ${MAX_PAY_RATE} or less`)
  }
  const rounded = Math.round(value * 100) / 100
  if (Math.abs(value - rounded) > 1e-9) {
    throw new Error(`${label} must have at most 2 decimal places`)
  }
  return value
}

const resetPasswordRateLimit = createIpRateLimit({
  maxRequests: 5,
  windowMs: 15 * 60 * 1000,
  message: 'Too many password reset attempts, please try again later',
})

function userAuditSnapshot(user: User | null): Record<string, unknown> | null {
  if (!user) return null
  return {
    id: user.id,
    username: user.username,
    display_name: user.display_name,
    role: user.role,
    active: user.active,
    standard_rate: user.standard_rate,
    enhanced_rate: user.enhanced_rate,
    supervisor_rate: user.supervisor_rate,
  }
}

async function getUserAuditSnapshotById(userId: string): Promise<Record<string, unknown> | null> {
  const users = await auth.getAllUsers()
  const user = users.find((candidate) => candidate.id === userId) ?? null
  return userAuditSnapshot(user)
}

async function writeUserAuditLog(
  action: 'add' | 'edit' | 'delete',
  actor: string,
  targetUserId: string | null,
  oldValues?: Record<string, unknown> | null,
  newValues?: Record<string, unknown> | null
): Promise<void> {
  try {
    await logChange(action, DB.USERS_TABLE, targetUserId, actor, oldValues, newValues)
  } catch (error) {
    console.error('Failed to write user audit log', error)
  }
}

function stripPayRatesFromUser(user: User): User {
  const { standard_rate: _standardRate, enhanced_rate: _enhancedRate, supervisor_rate: _supervisorRate, ...rest } = user
  return rest
}

router.use(requireManager)

router.get('/', async (req, res) => {
  const users = await auth.getAllUsers()
  const actor = req.session!.user!
  res.json({
    users: actor.role === 'admin' ? users : users.map(stripPayRatesFromUser),
  })
})

router.post('/', async (req, res) => {
  const { username, password, displayName, role } = req.body ?? {}
  if (!username || !password || !displayName) {
    res.status(400).json({ error: 'username, password, displayName required' })
    return
  }
  const [ok, msg] = await auth.createUser(username, password, displayName, role ?? 'employee')
  if (!ok) {
    res.status(400).json({ error: msg })
    return
  }
  res.json({ ok: true, message: msg })
})

router.put('/:id', async (req, res) => {
  const user = req.session!.user!
  const before = await getUserAuditSnapshotById(req.params.id)
  const { username, displayName, role, password } = req.body ?? {}
  if (!username || !displayName) {
    res.status(400).json({ error: 'username, displayName required' })
    return
  }
  const [ok, msg] = await auth.updateUser(
    req.params.id,
    username,
    displayName,
    role ?? 'employee',
    password || undefined,
    user.id
  )
  if (!ok) {
    res.status(400).json({ error: msg })
    return
  }
  const after = await getUserAuditSnapshotById(req.params.id)
  await writeUserAuditLog('edit', user.username, req.params.id, before, {
    ...(after ?? {}),
    event: before && after && before.role !== after.role ? 'user_role_change' : 'user_update',
    password_changed: Boolean(password),
  })
  res.json({ ok: true, message: msg })
})

router.delete('/:id', async (req, res) => {
  const user = req.session!.user!
  const [ok, msg] = await auth.deleteUser(req.params.id, user.id)
  if (!ok) {
    res.status(400).json({ error: msg })
    return
  }
  res.json({ ok: true, message: msg })
})

router.post('/:id/activate', async (req, res) => {
  const actor = req.session!.user!
  const before = await getUserAuditSnapshotById(req.params.id)
  const [ok, msg] = await auth.setUserActive(req.params.id, true)
  if (!ok) {
    res.status(400).json({ error: msg })
    return
  }
  const after = await getUserAuditSnapshotById(req.params.id)
  await writeUserAuditLog('edit', actor.username, req.params.id, before, {
    ...(after ?? {}),
    event: 'user_activated',
  })
  res.json({ ok: true, message: msg })
})

router.post('/:id/deactivate', async (req, res) => {
  const actor = req.session!.user!
  const before = await getUserAuditSnapshotById(req.params.id)
  const [ok, msg] = await auth.setUserActive(req.params.id, false)
  if (!ok) {
    res.status(400).json({ error: msg })
    return
  }
  const after = await getUserAuditSnapshotById(req.params.id)
  await writeUserAuditLog('edit', actor.username, req.params.id, before, {
    ...(after ?? {}),
    event: 'user_deactivated',
  })
  res.json({ ok: true, message: msg })
})

router.post('/:id/pay-rates', requireAdmin, async (req, res) => {
  const actor = req.session!.user!
  const before = await getUserAuditSnapshotById(req.params.id)
  const { standard, enhanced, supervisor } = req.body ?? {}
  let parsedStandard: number | null
  let parsedEnhanced: number | null
  let parsedSupervisor: number | null
  try {
    parsedStandard = parsePayRateInput(standard, 'standard')
    parsedEnhanced = parsePayRateInput(enhanced, 'enhanced')
    parsedSupervisor = parsePayRateInput(supervisor, 'supervisor')
  } catch (error) {
    res.status(400).json({ error: (error as Error).message })
    return
  }
  const [ok, msg] = await auth.setUserPayRates(
    req.params.id,
    parsedStandard,
    parsedEnhanced,
    parsedSupervisor
  )
  if (!ok) {
    res.status(400).json({ error: msg })
    return
  }
  const after = await getUserAuditSnapshotById(req.params.id)
  await writeUserAuditLog('edit', actor.username, req.params.id, before, {
    ...(after ?? {}),
    event: 'pay_rates_updated',
  })
  res.json({ ok: true, message: msg })
})

router.post('/:id/reset-password', resetPasswordRateLimit, async (req, res) => {
  const actor = req.session!.user!
  const target = await getUserAuditSnapshotById(req.params.id)
  const { newPassword } = req.body ?? {}
  if (!newPassword) {
    res.status(400).json({ error: 'newPassword required' })
    return
  }
  const [ok, msg] = await auth.changePasswordForUser(actor, req.params.id, newPassword)
  if (!ok) {
    res.status(400).json({ error: msg })
    return
  }
  await writeUserAuditLog(
    'edit',
    actor.username,
    req.params.id,
    target ? { ...target, event: 'password_reset_requested', password_reset: false } : { event: 'password_reset_requested', password_reset: false },
    target ? { ...target, event: 'password_reset_completed', password_reset: true } : { event: 'password_reset_completed', password_reset: true }
  )
  res.json({ ok: true, message: msg })
})

router.post('/:id/promote-admin', async (req, res) => {
  const actor = req.session!.user!
  const before = await getUserAuditSnapshotById(req.params.id)
  const [ok, msg] = await auth.promoteToAdmin(actor, req.params.id)
  if (!ok) {
    res.status(400).json({ error: msg })
    return
  }
  const after = await getUserAuditSnapshotById(req.params.id)
  await writeUserAuditLog('edit', actor.username, req.params.id, before, {
    ...(after ?? {}),
    event: 'user_promoted_to_admin',
  })
  res.json({ ok: true, message: msg })
})

export default router
