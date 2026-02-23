import { Router } from 'express'
import * as auth from '../auth/index.js'
import { requireManager } from '../middleware/auth.js'
import { createIpRateLimit } from '../middleware/rateLimit.js'

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

router.use(requireManager)

router.get('/', async (_req, res) => {
  const users = await auth.getAllUsers()
  res.json({ users })
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
  const [ok, msg] = await auth.setUserActive(req.params.id, true)
  if (!ok) {
    res.status(400).json({ error: msg })
    return
  }
  res.json({ ok: true, message: msg })
})

router.post('/:id/deactivate', async (req, res) => {
  const [ok, msg] = await auth.setUserActive(req.params.id, false)
  if (!ok) {
    res.status(400).json({ error: msg })
    return
  }
  res.json({ ok: true, message: msg })
})

router.post('/:id/pay-rates', async (req, res) => {
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
  res.json({ ok: true, message: msg })
})

router.post('/:id/reset-password', resetPasswordRateLimit, async (req, res) => {
  const actor = req.session!.user!
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
  res.json({ ok: true, message: msg })
})

router.post('/:id/promote-admin', async (req, res) => {
  const actor = req.session!.user!
  const [ok, msg] = await auth.promoteToAdmin(actor, req.params.id)
  if (!ok) {
    res.status(400).json({ error: msg })
    return
  }
  res.json({ ok: true, message: msg })
})

export default router
