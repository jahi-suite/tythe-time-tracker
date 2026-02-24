import { Router } from 'express'
import * as auth from '../auth/index.js'
import { logChange } from '../audit.js'
import { requireAuth } from '../middleware/auth.js'
import { createIpRateLimit } from '../middleware/rateLimit.js'
import { getSessionCookieOptions } from '../sessionConfig.js'
import { DB } from '../../shared/constants.js'
import type { User } from '../../shared/types.js'

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

async function getUserAuditSnapshotByUsername(username: string): Promise<Record<string, unknown> | null> {
  const users = await auth.getAllUsers()
  const user = users.find((candidate) => candidate.username === username.trim()) ?? null
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
  // Must not send response until destroy completes — session store must persist deletion
  req.session.destroy((err: Error | null) => {
    if (err) {
      res.status(500).json({ error: 'Logout failed' })
      return
    }
    const opts = getSessionCookieOptions()
    res.clearCookie('connect.sid', { ...opts, path: '/', httpOnly: true, sameSite: 'lax', secure: opts.secure })
    // Cover Netlify env mismatch: cookie may have been set with secure:false if NODE_ENV was wrong
    if (opts.secure) {
      res.clearCookie('connect.sid', { ...opts, path: '/', httpOnly: true, sameSite: 'lax', secure: false })
    }
    res.json({ ok: true })
  })
})

router.get('/me', async (req, res) => {
  const sessionUser = req.session?.user
  if (!sessionUser) {
    res.status(401).json({ error: 'Not authenticated' })
    return
  }
  const freshUser = await auth.getAuthUserById(sessionUser.id)
  if (!freshUser) {
    await new Promise<void>((resolve) => {
      req.session?.destroy(() => resolve())
    })
    res.status(401).json({ error: 'Not authenticated' })
    return
  }
  // Belt-and-suspenders: reject if both identifiers empty (should not happen after getAuthUserById)
  if (!freshUser.display_name?.trim() && !freshUser.username?.trim()) {
    await new Promise<void>((resolve) => {
      req.session?.destroy(() => resolve())
    })
    res.status(401).json({ error: 'Not authenticated' })
    return
  }
  req.session!.user = freshUser
  res.json(freshUser)
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
  const { username, password, displayName, setupToken } = req.body ?? {}
  if (!username || !password || !displayName) {
    res.status(400).json({ error: 'Username, password, and display name required' })
    return
  }
  const requiredFirstSetupToken = process.env.FIRST_SETUP_TOKEN?.trim()
  if (requiredFirstSetupToken) {
    const needsSetup = await auth.isUsersTableEmpty()
    if (needsSetup && setupToken !== requiredFirstSetupToken) {
      res.status(403).json({ error: 'Invalid first-setup token' })
      return
    }
  }
  const [ok, msg] = await auth.createFirstManager(username, password, displayName)
  if (!ok) {
    res.status(400).json({ error: msg })
    return
  }
  const createdUser = await getUserAuditSnapshotByUsername(username)
  await writeUserAuditLog(
    'add',
    'first-setup',
    (createdUser?.id as string | undefined) ?? null,
    null,
    {
      ...(createdUser ?? {}),
      event: 'first_setup_manager_created',
      display_name: displayName,
    }
  )
  res.json({ ok: true, message: msg })
})

export default router
