import { Router } from 'express'
import * as timeTracking from '../services/timeTracking.js'
import { requireManager } from '../middleware/auth.js'
import { convertToUtc } from '../utils/timeUtils.js'
import type { PayRateType } from '../../shared/types.js'

const router = Router()
const ALLOWED_PAY_RATE_OVERRIDES: readonly PayRateType[] = ['Standard', 'Enhanced', 'Supervisor']

function isValidDate(value: Date): boolean {
  return !Number.isNaN(value.getTime())
}

function parseOptionalPayRateOverride(value: unknown): PayRateType | null {
  if (value === undefined || value === null || value === '') return null
  if (
    typeof value === 'string' &&
    (ALLOWED_PAY_RATE_OVERRIDES as readonly string[]).includes(value)
  ) {
    return value as PayRateType
  }
  throw new Error('payRateOverride must be one of Standard, Enhanced, Supervisor, or null')
}

function combineUkLocalDateAndTime(datePart: Date, timePart: Date): Date {
  return convertToUtc(
    datePart.getFullYear(),
    datePart.getMonth() + 1,
    datePart.getDate(),
    timePart.getHours(),
    timePart.getMinutes()
  )
}

function validateShiftPayload(body: unknown): {
  employeeName: string
  clockInDate: Date
  clockInTime: Date
  clockOutDate: Date | null
  clockOutTime: Date | null
  isSupervisor: boolean
  payRateOverride: PayRateType | null
} {
  const {
    employeeName,
    clockInDate,
    clockInTime,
    clockOutDate,
    clockOutTime,
    isSupervisor,
    payRateOverride,
  } = (body ?? {}) as Record<string, unknown>

  if (!employeeName || !clockInDate || !clockInTime) {
    throw new Error('employeeName, clockInDate, clockInTime required')
  }

  const parsedClockInDate = new Date(clockInDate as string | number | Date)
  const parsedClockInTime = new Date(clockInTime as string | number | Date)
  if (!isValidDate(parsedClockInDate) || !isValidDate(parsedClockInTime)) {
    throw new Error('clockInDate and clockInTime must be valid dates')
  }

  const hasClockOutDate = clockOutDate !== undefined && clockOutDate !== null && clockOutDate !== ''
  const hasClockOutTime = clockOutTime !== undefined && clockOutTime !== null && clockOutTime !== ''
  if (hasClockOutDate !== hasClockOutTime) {
    throw new Error('clockOutDate and clockOutTime must both be provided together')
  }

  let parsedClockOutDate: Date | null = null
  let parsedClockOutTime: Date | null = null
  if (hasClockOutDate && hasClockOutTime) {
    parsedClockOutDate = new Date(clockOutDate as string | number | Date)
    parsedClockOutTime = new Date(clockOutTime as string | number | Date)
    if (!isValidDate(parsedClockOutDate) || !isValidDate(parsedClockOutTime)) {
      throw new Error('clockOutDate and clockOutTime must be valid dates')
    }

    const clockInUtc = combineUkLocalDateAndTime(parsedClockInDate, parsedClockInTime)
    const clockOutUtc = combineUkLocalDateAndTime(parsedClockOutDate, parsedClockOutTime)
    if (clockOutUtc.getTime() < clockInUtc.getTime()) {
      throw new Error('clockOut must be after or equal to clockIn')
    }
  }

  return {
    employeeName: String(employeeName),
    clockInDate: parsedClockInDate,
    clockInTime: parsedClockInTime,
    clockOutDate: parsedClockOutDate,
    clockOutTime: parsedClockOutTime,
    isSupervisor: isSupervisor === true,
    payRateOverride: parseOptionalPayRateOverride(payRateOverride),
  }
}

router.use(requireManager)

router.post('/', async (req, res) => {
  const user = req.session!.user!
  let payload: ReturnType<typeof validateShiftPayload>
  try {
    payload = validateShiftPayload(req.body)
  } catch (error) {
    res.status(400).json({ error: (error as Error).message })
    return
  }
  const [ok, msg] = await timeTracking.addShift(
    payload.employeeName,
    payload.clockInDate,
    payload.clockInTime,
    payload.clockOutDate,
    payload.clockOutTime,
    payload.isSupervisor,
    payload.payRateOverride,
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
  let payload: ReturnType<typeof validateShiftPayload>
  try {
    payload = validateShiftPayload(req.body)
  } catch (error) {
    res.status(400).json({ error: (error as Error).message })
    return
  }
  const [ok, msg] = await timeTracking.editShift(
    req.params.id,
    payload.employeeName,
    payload.clockInDate,
    payload.clockInTime,
    payload.clockOutDate,
    payload.clockOutTime,
    payload.isSupervisor,
    payload.payRateOverride,
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
