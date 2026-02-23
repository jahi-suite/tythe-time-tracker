import { Router } from 'express'
import * as timeTracking from '../services/timeTracking.js'
import { exportToExcel, exportToPdf } from '../services/exportService.js'
import { requireAuth, requireManager } from '../middleware/auth.js'

const router = Router()

router.use(requireAuth)

router.get('/excel', async (req, res) => {
  const user = req.session!.user!
  const employeeName = req.query.employee as string | undefined
  const start = req.query.start ? new Date(req.query.start as string) : undefined
  const end = req.query.end ? new Date(req.query.end as string) : undefined

  const entries =
    user.role === 'manager' || user.role === 'admin'
      ? employeeName
        ? await timeTracking.getEmployeeTimesheet(employeeName, start, end)
        : await timeTracking.getAllTimesheets(start, end)
      : await timeTracking.getEmployeeTimesheet(user.display_name, start, end, user.id)

  const buf = await exportToExcel(entries, start, end)
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="timesheet_${new Date().toISOString().slice(0, 10)}.xlsx"`
  )
  res.send(buf)
})

router.get('/pdf', async (req, res) => {
  const user = req.session!.user!
  const employeeName = req.query.employee as string | undefined
  const start = req.query.start ? new Date(req.query.start as string) : undefined
  const end = req.query.end ? new Date(req.query.end as string) : undefined

  const entries =
    user.role === 'manager' || user.role === 'admin'
      ? employeeName
        ? await timeTracking.getEmployeeTimesheet(employeeName, start, end)
        : await timeTracking.getAllTimesheets(start, end)
      : await timeTracking.getEmployeeTimesheet(user.display_name, start, end, user.id)

  const buf = await exportToPdf(entries)
  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="timesheet_${new Date().toISOString().slice(0, 10)}.pdf"`
  )
  res.send(buf)
})

export default router
