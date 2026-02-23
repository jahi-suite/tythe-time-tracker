import { Router } from 'express'
import * as timeTracking from '../services/timeTracking.js'
import { requireAuth, requireManager } from '../middleware/auth.js'

const router = Router()

router.use(requireAuth)

router.get('/', async (req, res) => {
  const user = req.session!.user!
  const start = req.query.start ? new Date(req.query.start as string) : undefined
  const end = req.query.end ? new Date(req.query.end as string) : undefined
  const entries = await timeTracking.getEmployeeTimesheet(user.display_name, start, end, user.id)
  res.json({
    entries: entries.map((e) => ({
      id: e.id,
      user_id: e.user_id,
      employee: e.employee,
      clock_in: e.clock_in.toISOString(),
      clock_out: e.clock_out?.toISOString() ?? null,
      pay_rate_type: e.pay_rate_type,
      created_at: e.created_at.toISOString(),
    })),
  })
})

router.get('/all', requireManager, async (req, res) => {
  const start = req.query.start ? new Date(req.query.start as string) : undefined
  const end = req.query.end ? new Date(req.query.end as string) : undefined
  const entries = await timeTracking.getAllTimesheets(start, end)
  res.json({
    entries: entries.map((e) => ({
      id: e.id,
      user_id: e.user_id,
      employee: e.employee,
      clock_in: e.clock_in.toISOString(),
      clock_out: e.clock_out?.toISOString() ?? null,
      pay_rate_type: e.pay_rate_type,
      created_at: e.created_at.toISOString(),
    })),
  })
})

export default router
