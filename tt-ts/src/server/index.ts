import 'dotenv/config'
import express from 'express'
import session from 'express-session'
import cookieParser from 'cookie-parser'
import path from 'path'
import { createRequire } from 'module'
import { fileURLToPath } from 'url'

import authRoutes from './routes/auth.js'
import clockRoutes from './routes/clock.js'
import timesheetRoutes from './routes/timesheet.js'
import shiftsRoutes from './routes/shifts.js'
import usersRoutes from './routes/users.js'
import auditRoutes from './routes/audit.js'
import exportRoutes from './routes/export.js'
import { requireSameOriginForMutations } from './middleware/csrf.js'
import { getPool } from './db/connection.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const require = createRequire(import.meta.url)

const app = express()
const PORT = process.env.PORT || 3000
const isProduction = process.env.NODE_ENV === 'production'
const sessionSecret = process.env.SESSION_SECRET?.trim()
const sessionStoreMode = (process.env.SESSION_STORE?.trim().toLowerCase() ||
  (isProduction ? 'pg' : 'memory')) as 'memory' | 'pg' | 'redis'

if (isProduction && !sessionSecret) {
  throw new Error('SESSION_SECRET is required when NODE_ENV=production')
}

async function createSessionStore(): Promise<session.Store | undefined> {
  if (sessionStoreMode === 'memory') {
    return undefined
  }

  if (sessionStoreMode === 'pg') {
    let pgStoreFactory: unknown

    try {
      pgStoreFactory = require('connect-pg-simple')
    } catch {
      throw new Error(
        'SESSION_STORE=pg requires connect-pg-simple. Install it in tt-ts before starting the server.'
      )
    }

    const createPgStore =
      typeof (pgStoreFactory as { default?: unknown }).default === 'function'
        ? (pgStoreFactory as { default: Function }).default
        : (pgStoreFactory as Function)
    const PgStore = createPgStore(session)

    return new PgStore({
      pool: getPool(),
      tableName: process.env.SESSION_PG_TABLE?.trim() || 'user_sessions',
      createTableIfMissing: true,
    })
  }

  if (sessionStoreMode === 'redis') {
    const redisUrl = process.env.REDIS_URL?.trim()
    if (!redisUrl) {
      throw new Error('SESSION_STORE=redis requires REDIS_URL')
    }

    let redisModule: unknown
    let connectRedisModule: unknown
    try {
      redisModule = require('redis')
      connectRedisModule = require('connect-redis')
    } catch {
      throw new Error(
        'SESSION_STORE=redis requires redis and connect-redis. Install them in tt-ts before starting the server.'
      )
    }

    const createClient = (redisModule as { createClient?: Function }).createClient
    if (typeof createClient !== 'function') {
      throw new Error('Could not load redis.createClient for SESSION_STORE=redis')
    }

    const client = createClient({ url: redisUrl })
    if (typeof client.on === 'function') {
      client.on('error', (error: unknown) => {
        console.error('Redis session store error:', error)
      })
    }
    if (!client.isOpen && typeof client.connect === 'function') {
      await client.connect()
    }

    const resolvedConnectRedis = (connectRedisModule as { default?: unknown }).default || connectRedisModule
    const RedisStore =
      (resolvedConnectRedis as { RedisStore?: unknown }).RedisStore ||
      resolvedConnectRedis

    if (typeof RedisStore !== 'function') {
      throw new Error('Could not load RedisStore from connect-redis')
    }

    return new (RedisStore as new (options: Record<string, unknown>) => session.Store)({
      client,
      prefix: process.env.REDIS_SESSION_PREFIX?.trim() || 'tt:sess:',
    })
  }

  throw new Error(
    `Unsupported SESSION_STORE="${sessionStoreMode}". Use memory, pg, or redis.`
  )
}

app.use(cookieParser())
app.use(express.json())

async function startServer() {
  const store = await createSessionStore()

  app.use(
    session({
      secret: sessionSecret || 'tythe-dev-secret-change-in-production',
      resave: false,
      saveUninitialized: false,
      store,
      cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000,
      },
    })
  )

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', message: 'Tythe Time Tracker API' })
  })

  app.use('/api', requireSameOriginForMutations)

  app.use('/api/auth', authRoutes)
  app.use('/api/clock', clockRoutes)
  app.use('/api/timesheet', timesheetRoutes)
  app.use('/api/shifts', shiftsRoutes)
  app.use('/api/users', usersRoutes)
  app.use('/api/audit', auditRoutes)
  app.use('/api/export', exportRoutes)

  // Serve static client (dist is at project root, sibling of src/server)
  const distPath = path.join(__dirname, '..', '..', 'dist')
  app.use(express.static(distPath))

  app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'))
  })

  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT} (session store: ${sessionStoreMode})`)
  })
}

void startServer().catch((error) => {
  console.error('Failed to start server:', error)
  process.exit(1)
})
