import { Router } from 'express'
import { DB } from '../../shared/constants.js'
import { query } from '../db/connection.js'
import { requireDevSecret, requireDevVenuesEnabled } from '../middleware/dev.js'

const router = Router()

type DevVenueRow = {
  name: string
  slug: string
  active: boolean
  staff_count: number
  last_used: Date | null
}

router.get('/venues', requireDevVenuesEnabled, requireDevSecret, async (_req, res) => {
  const result = await query<DevVenueRow>(
    `SELECT v.name,
            v.slug,
            v.active,
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
      active: row.active,
      staff_count: row.staff_count ?? 0,
      last_used: row.last_used ? row.last_used.toISOString() : null,
    }))
  )
})

router.post('/venues/:slug/deactivate', requireDevVenuesEnabled, requireDevSecret, async (req, res) => {
  const slug = String(req.params.slug ?? '').trim().toLowerCase()
  if (!slug) {
    res.status(400).json({ error: 'Slug required' })
    return
  }
  if (slug === 'tythe') {
    res.status(400).json({ error: 'Cannot deactivate Tythe' })
    return
  }

  const result = await query<{ name: string; slug: string; active: boolean }>(
    `UPDATE ${DB.VENUES_TABLE}
     SET active = false
     WHERE slug = $1
     RETURNING name, slug, active`,
    [slug]
  )

  if (result.rowCount === 0) {
    res.status(404).json({ error: 'Venue not found' })
    return
  }

  res.json(result.rows[0])
})

router.post('/venues/:slug/verify', requireDevVenuesEnabled, requireDevSecret, async (req, res) => {
  const slug = String(req.params.slug ?? '').trim().toLowerCase()
  if (!slug) {
    res.status(400).json({ error: 'Slug required' })
    return
  }

  const result = await query<{ id: string; slug: string; name: string }>(
    `UPDATE ${DB.VENUES_TABLE}
     SET ${DB.EMAIL_VERIFIED_COLUMN} = TRUE, ${DB.VERIFICATION_TOKEN_HASH_COLUMN} = NULL
     WHERE slug = $1
     RETURNING ${DB.ID_COLUMN}, slug, name`,
    [slug]
  )

  if (result.rowCount === 0) {
    res.status(404).json({ error: 'Venue not found' })
    return
  }

  console.log(`[Dev] venue_verified slug=${slug}`)
  res.json({ ok: true, venue: result.rows[0] })
})

router.post('/venues/:slug/reactivate', requireDevVenuesEnabled, requireDevSecret, async (req, res) => {
  const slug = String(req.params.slug ?? '').trim().toLowerCase()
  if (!slug) {
    res.status(400).json({ error: 'Slug required' })
    return
  }

  const result = await query<{ name: string; slug: string; active: boolean }>(
    `UPDATE ${DB.VENUES_TABLE}
     SET active = true
     WHERE slug = $1
     RETURNING name, slug, active`,
    [slug]
  )

  if (result.rowCount === 0) {
    res.status(404).json({ error: 'Venue not found' })
    return
  }

  res.json(result.rows[0])
})

export default router
