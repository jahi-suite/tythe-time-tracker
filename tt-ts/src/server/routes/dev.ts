import { Router } from 'express'
import { DB } from '../../shared/constants.js'
import { query } from '../db/connection.js'

const router = Router()

type DevVenueRow = {
  name: string
  slug: string
  staff_count: number
  last_used: Date | null
}

router.get('/venues', async (req, res) => {
  if (process.env.DEV_VENUES_ENABLED !== 'true') {
    res.status(404).json({ error: 'Not found' })
    return
  }

  const configuredSecret = process.env.DEV_SECRET?.trim()
  if (configuredSecret) {
    const headerSecret = req.get('X-Dev-Secret')?.trim()
    const cookieSecret =
      typeof req.cookies?.dev_secret === 'string' ? req.cookies.dev_secret.trim() : undefined
    if (headerSecret !== configuredSecret && cookieSecret !== configuredSecret) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }
  }

  const result = await query<DevVenueRow>(
    `SELECT v.name,
            v.slug,
            COALESCE(u.staff_count, 0) AS staff_count,
            te.last_used
     FROM ${DB.VENUES_TABLE} v
     LEFT JOIN (
       SELECT ${DB.VENUE_ID_COLUMN}, COUNT(*)::int AS staff_count
       FROM ${DB.USERS_TABLE}
       GROUP BY ${DB.VENUE_ID_COLUMN}
     ) u ON u.${DB.VENUE_ID_COLUMN} = v.${DB.ID_COLUMN}
     LEFT JOIN (
       SELECT ${DB.VENUE_ID_COLUMN},
              MAX(COALESCE(${DB.CLOCK_OUT_COLUMN}, ${DB.CLOCK_IN_COLUMN})) AS last_used
       FROM ${DB.TIME_ENTRIES_TABLE}
       GROUP BY ${DB.VENUE_ID_COLUMN}
     ) te ON te.${DB.VENUE_ID_COLUMN} = v.${DB.ID_COLUMN}
     ORDER BY v.name ASC`
  )

  res.json(
    result.rows.map((row) => ({
      name: row.name,
      slug: row.slug,
      staff_count: row.staff_count ?? 0,
      last_used: row.last_used ? row.last_used.toISOString() : null,
    }))
  )
})

export default router
