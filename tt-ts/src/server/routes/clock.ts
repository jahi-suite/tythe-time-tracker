import { Router, type Request } from 'express'
import * as timeTracking from '../services/timeTracking.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.use(requireAuth)

function getSessionVenueId(req: Request): string | null {
  return req.session?.venue_id ?? null
}

router.post('/in', async (req, res) => {
  const user = req.session!.user!
  const venueId = getSessionVenueId(req)
  if (!venueId) {
    res.status(400).json({ error: 'Venue context missing' })
    return
  }
  const { isSupervisor } = req.body ?? {}
  const [ok, msg] = await timeTracking.clockIn(user.display_name, isSupervisor === true, user.id, venueId)
  if (!ok) {
    res.status(400).json({ error: msg })
    return
  }
  res.json({ ok: true, message: msg })
})

router.post('/out', async (req, res) => {
  const user = req.session!.user!
  const venueId = getSessionVenueId(req)
  if (!venueId) {
    res.status(400).json({ error: 'Venue context missing' })
    return
  }
  const [ok, msg] = await timeTracking.clockOut(user.display_name, user.id, venueId)
  if (!ok) {
    res.status(400).json({ error: msg })
    return
  }
  res.json({ ok: true, message: msg })
})

router.get('/open', async (req, res) => {
  const user = req.session!.user!
  const venueId = getSessionVenueId(req)
  if (!venueId) {
    res.status(400).json({ error: 'Venue context missing' })
    return
  }
  const shift = await timeTracking.getOpenShift(user.display_name, user.id, venueId)
  if (!shift) {
    res.json({ shift: null })
    return
  }
  res.json({
    shift: {
      id: shift.id,
      user_id: shift.user_id,
      employee: shift.employee,
      clock_in: shift.clock_in.toISOString(),
      pay_rate_type: shift.pay_rate_type,
    },
  })
})

export default router
