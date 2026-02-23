import { Router } from 'express'
import * as auth from '../auth/index.js'
import { requireAuth } from '../middleware/auth.js'
import { createIpRateLimit } from '../middleware/rateLimit.js'

const router = Router()
const loginRateLimit = createIpRateLimit({
  maxRequests: 5,
  windowMs: 15 * 60 * 1000,
  message: 'Too many login attempts, please try again later',
})
const authMutationRateLimit = createIpRateLimit({
  maxRequests: 5,
  windowMs: 15 * 60 * 1000,
})

router.post('/login', loginRateLimit, async (req, res) => {
  const { username, password } = req.body ?? {}
  if (!username || !password) {
    res.status(400).json({ error: 'Username and password required' })
    return
  }
  const user = await auth.authenticateUser(username, password)
  if (!user) {
    res.status(401).json({ error: 'Invalid username or password' })
    return
  }
  req.session!.regenerate((err: Error | null) => {
    if (err) {
      res.status(500).json({ error: 'Login failed' })
      return
    }
    req.session!.user = user
    res.json(user)
  })
})

router.post('/logout', (req, res) => {
  req.session.destroy((err: Error | null) => {
    if (err) {
      res.status(500).json({ error: 'Logout failed' })
      return
    }
    res.clearCookie('connect.sid', {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    })
    res.json({ ok: true })
  })
})

router.get('/me', (req, res) => {
  const user = req.session?.user
  if (!user) {
    res.status(401).json({ error: 'Not authenticated' })
    return
  }
  res.json(user)
})

router.post('/change-password', authMutationRateLimit, requireAuth, async (req, res) => {
  const { currentPassword, newPassword } = req.body ?? {}
  const user = req.session!.user!
  if (!currentPassword || !newPassword) {
    res.status(400).json({ error: 'Current and new password required' })
    return
  }
  const [ok, msg] = await auth.changePasswordSelf(user.id, currentPassword, newPassword)
  if (!ok) {
    res.status(400).json({ error: msg })
    return
  }
  res.json({ ok: true, message: msg })
})

router.get('/admin-count', async (_req, res) => {
  const count = await auth.countAdmins()
  res.json({ count })
})

router.get('/first-setup', async (_req, res) => {
  const empty = await auth.isUsersTableEmpty()
  res.json({ needsSetup: empty })
})

router.post('/first-setup', authMutationRateLimit, async (req, res) => {
  const { username, password, displayName } = req.body ?? {}
  if (!username || !password || !displayName) {
    res.status(400).json({ error: 'Username, password, and display name required' })
    return
  }
  const [ok, msg] = await auth.createFirstManager(username, password, displayName)
  if (!ok) {
    res.status(400).json({ error: msg })
    return
  }
  res.json({ ok: true, message: msg })
})

export default router
