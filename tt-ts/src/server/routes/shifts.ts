import { Router } from 'express'
import * as timeTracking from '../services/timeTracking.js'
import { requireManager } from '../middleware/auth.js'

const router = Router()

router.use(requireManager)

router.post('/', async (req, res) => {
  const user = req.session!.user!
  const {
    employeeName,
    clockInDate,
    clockInTime,
    clockOutDate,
    clockOutTime,
    isSupervisor,
    payRateOverride,
  } = req.body ?? {}
  if (!employeeName || !clockInDate || !clockInTime) {
    res.status(400).json({ error: 'employeeName, clockInDate, clockInTime required' })
    return
  }
  const [ok, msg] = await timeTracking.addShift(
    employeeName,
    new Date(clockInDate),
    new Date(clockInTime),
    clockOutDate ? new Date(clockOutDate) : null,
    clockOutTime ? new Date(clockOutTime) : null,
    isSupervisor === true,
    payRateOverride || null,
    user.username
  )
  if (!ok) {
    res.status(400).json({ error: msg })
    return
  }
  res.json({ ok: true, message: msg })
})

router.put('/:id', async (req, res) => {
  const user = req.session!.user!
  const {
    employeeName,
    clockInDate,
    clockInTime,
    clockOutDate,
    clockOutTime,
    isSupervisor,
    payRateOverride,
  } = req.body ?? {}
  if (!employeeName || !clockInDate || !clockInTime) {
    res.status(400).json({ error: 'employeeName, clockInDate, clockInTime required' })
    return
  }
  const [ok, msg] = await timeTracking.editShift(
    req.params.id,
    employeeName,
    new Date(clockInDate),
    new Date(clockInTime),
    clockOutDate ? new Date(clockOutDate) : null,
    clockOutTime ? new Date(clockOutTime) : null,
    isSupervisor === true,
    payRateOverride || null,
    user.username
  )
  if (!ok) {
    res.status(400).json({ error: msg })
    return
  }
  res.json({ ok: true, message: msg })
})

router.delete('/:id', async (req, res) => {
  const user = req.session!.user!
  const [ok, msg] = await timeTracking.deleteEntry(req.params.id, user.username)
  if (!ok) {
    res.status(400).json({ error: msg })
    return
  }
  res.json({ ok: true, message: msg })
})

router.get('/:id', async (req, res) => {
  const shift = await timeTracking.getShiftById(req.params.id)
  if (!shift) {
    res.status(404).json({ error: 'Shift not found' })
    return
  }
  res.json({
    id: shift.id,
    employee: shift.employee,
    clock_in: shift.clock_in.toISOString(),
    clock_out: shift.clock_out?.toISOString() ?? null,
    pay_rate_type: shift.pay_rate_type,
    created_at: shift.created_at.toISOString(),
  })
})

export default router
