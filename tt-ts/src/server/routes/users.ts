import { Router } from 'express'
import * as auth from '../auth/index.js'
import { requireManager } from '../middleware/auth.js'

const router = Router()

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
  const [ok, msg] = await auth.setUserPayRates(
    req.params.id,
    standard ?? null,
    enhanced ?? null,
    supervisor ?? null
  )
  if (!ok) {
    res.status(400).json({ error: msg })
    return
  }
  res.json({ ok: true, message: msg })
})

router.post('/:id/reset-password', async (req, res) => {
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
