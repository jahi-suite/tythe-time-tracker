import 'dotenv/config'
import express from 'express'
import session from 'express-session'
import cookieParser from 'cookie-parser'
import path from 'path'
import { fileURLToPath } from 'url'

import authRoutes from './routes/auth.js'
import clockRoutes from './routes/clock.js'
import timesheetRoutes from './routes/timesheet.js'
import shiftsRoutes from './routes/shifts.js'
import usersRoutes from './routes/users.js'
import auditRoutes from './routes/audit.js'
import exportRoutes from './routes/export.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const app = express()
const PORT = process.env.PORT || 3000

app.use(cookieParser())
app.use(express.json())
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'tythe-dev-secret-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === 'production', httpOnly: true, maxAge: 24 * 60 * 60 * 1000 },
  })
)

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Tythe Time Tracker API' })
})

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
  console.log(`Server running at http://localhost:${PORT}`)
})
