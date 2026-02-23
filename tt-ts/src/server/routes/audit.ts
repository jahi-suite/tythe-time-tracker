import { Router } from 'express'
import { getAuditLogs } from '../audit.js'
import { requireManager } from '../middleware/auth.js'

const router = Router()

router.use(requireManager)

router.get('/', async (req, res) => {
  const action = req.query.action as string | undefined
  const target_table = req.query.target_table as string | undefined
  const changed_by = req.query.changed_by as string | undefined
  const start_date = req.query.start_date ? new Date(req.query.start_date as string) : undefined
  const end_date = req.query.end_date ? new Date(req.query.end_date as string) : undefined
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined

  const logs = await getAuditLogs({
    action,
    target_table,
    changed_by,
    start_date,
    end_date,
    limit,
  })
  res.json({
    logs: logs.map((l) => ({
      id: l.id,
      action: l.action,
      target_table: l.target_table,
      target_id: l.target_id,
      changed_by: l.changed_by,
      old_values: l.old_values,
      new_values: l.new_values,
      created_at: l.created_at.toISOString(),
    })),
  })
})

export default router
