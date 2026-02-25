import { Router } from 'express'
import type pg from 'pg'
import { DB } from '../../shared/constants.js'
import { hashPassword } from '../auth/index.js'
import { getClient, query } from '../db/connection.js'
import { createIpRateLimit } from '../middleware/rateLimit.js'
import { requireAdmin, requireAuth } from '../middleware/auth.js'
import * as auth from '../auth/index.js'

const router = Router()

const createVenueRateLimit = createIpRateLimit({
  maxRequests: 5,
  windowMs: 15 * 60 * 1000,
  message: 'Too many venue creation attempts, please try again later',
})

type VenueSearchRow = {
  slug: string
  name: string
}

function slugifyVenueName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function parseCreateVenueBody(body: unknown): {
  venueName: string
  username: string
  password: string
  displayName: string
} {
  const record = (body && typeof body === 'object' ? body : {}) as Record<string, unknown>
  return {
    venueName: String(record.venueName ?? record.name ?? '').trim(),
    username: String(record.adminUsername ?? record.username ?? '').trim(),
    password: String(record.adminPassword ?? record.password ?? ''),
    displayName: String(record.adminDisplayName ?? record.displayName ?? '').trim(),
  }
}

function isUniqueViolation(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false
  const maybePg = error as Partial<pg.DatabaseError> & { code?: string }
  return maybePg.code === '23505'
}

router.get('/search', async (req, res) => {
  const q = String(req.query.q ?? '').trim()
  if (!q) {
    res.json([])
    return
  }

  const result = await query<VenueSearchRow>(
    `SELECT slug, name
     FROM ${DB.VENUES_TABLE}
     WHERE slug ILIKE $1 OR name ILIKE $1
     ORDER BY
       CASE WHEN slug = LOWER($2) THEN 0 ELSE 1 END,
       CASE WHEN LOWER(name) = LOWER($2) THEN 0 ELSE 1 END,
       name ASC
     LIMIT 10`,
    [`%${q}%`, q]
  )

  res.json(
    result.rows.map((row) => ({
      slug: row.slug,
      name: row.name,
    }))
  )
})

router.get('/current/settings', requireAuth, async (req, res) => {
  const sessionVenueId = req.session?.venue_id
  if (!sessionVenueId) {
    res.status(400).json({ error: 'Venue context missing from session' })
    return
  }

  const settings = await auth.getVenueSettings(sessionVenueId)
  res.json(settings)
})

router.get('/:slug/settings', requireAdmin, async (req, res) => {
  const slug = String(req.params.slug ?? '').trim()
  const sessionVenueId = req.session?.venue_id
  if (!slug || !sessionVenueId) {
    res.status(400).json({ error: 'Slug required' })
    return
  }
  const venue = await auth.getVenueBySlug(slug)
  if (!venue) {
    res.status(404).json({ error: 'Venue not found' })
    return
  }
  if (venue.id !== sessionVenueId) {
    res.status(403).json({ error: 'Can only view your own venue settings' })
    return
  }
  const settings = await auth.getVenueSettings(venue.id)
  res.json(settings)
})

router.put('/:slug/settings', requireAdmin, async (req, res) => {
  const slug = String(req.params.slug ?? '').trim()
  const sessionVenueId = req.session?.venue_id
  if (!slug || !sessionVenueId) {
    res.status(400).json({ error: 'Slug required' })
    return
  }
  const venue = await auth.getVenueBySlug(slug)
  if (!venue) {
    res.status(404).json({ error: 'Venue not found' })
    return
  }
  if (venue.id !== sessionVenueId) {
    res.status(403).json({ error: 'Can only edit your own venue settings' })
    return
  }
  const body = (req.body && typeof req.body === 'object' ? req.body : {}) as Record<string, unknown>
  const enhanced_enabled = body.enhanced_enabled
  const enhanced_start_hour = body.enhanced_start_hour != null ? Number(body.enhanced_start_hour) : undefined
  const enhanced_end_hour = body.enhanced_end_hour != null ? Number(body.enhanced_end_hour) : undefined
  const break_deduct_enabled = body.break_deduct_enabled
  const break_deduct_minutes = body.break_deduct_minutes != null ? Number(body.break_deduct_minutes) : undefined
  const break_threshold_hours = body.break_threshold_hours != null ? Number(body.break_threshold_hours) : undefined
  const supervisor_enabled = body.supervisor_enabled
  const supervisor_label = body.supervisor_label != null ? String(body.supervisor_label).trim() : undefined
  const supervisor_deduct_break = body.supervisor_deduct_break

  const updates: string[] = []
  const values: unknown[] = []
  let i = 1
  if (typeof enhanced_enabled === 'boolean') {
    updates.push(`enhanced_enabled = $${i++}`)
    values.push(enhanced_enabled)
  }
  if (enhanced_start_hour != null && Number.isInteger(enhanced_start_hour) && enhanced_start_hour >= 0 && enhanced_start_hour <= 23) {
    updates.push(`enhanced_start_hour = $${i++}`)
    values.push(enhanced_start_hour)
  }
  if (enhanced_end_hour != null && Number.isInteger(enhanced_end_hour) && enhanced_end_hour >= 0 && enhanced_end_hour <= 23) {
    updates.push(`enhanced_end_hour = $${i++}`)
    values.push(enhanced_end_hour)
  }
  if (typeof break_deduct_enabled === 'boolean') {
    updates.push(`break_deduct_enabled = $${i++}`)
    values.push(break_deduct_enabled)
  }
  if (break_deduct_minutes != null && Number.isFinite(break_deduct_minutes) && break_deduct_minutes >= 0 && break_deduct_minutes <= 120) {
    updates.push(`break_deduct_minutes = $${i++}`)
    values.push(Math.round(break_deduct_minutes))
  }
  if (break_threshold_hours != null && Number.isFinite(break_threshold_hours) && break_threshold_hours >= 0 && break_threshold_hours <= 24) {
    updates.push(`break_threshold_hours = $${i++}`)
    values.push(break_threshold_hours)
  }
  if (typeof supervisor_enabled === 'boolean') {
    updates.push(`supervisor_enabled = $${i++}`)
    values.push(supervisor_enabled)
  }
  if (supervisor_label != null && supervisor_label.length > 0 && supervisor_label.length <= 64) {
    updates.push(`supervisor_label = $${i++}`)
    values.push(supervisor_label)
  }
  if (typeof supervisor_deduct_break === 'boolean') {
    updates.push(`supervisor_deduct_break = $${i++}`)
    values.push(supervisor_deduct_break)
  }
  if (updates.length === 0) {
    res.status(400).json({ error: 'No valid settings to update' })
    return
  }
  values.push(venue.id)
  await query(
    `UPDATE ${DB.VENUES_TABLE}
     SET ${updates.join(', ')}
     WHERE ${DB.ID_COLUMN} = $${i}`,
    values
  )
  const settings = await auth.getVenueSettings(venue.id)
  res.json(settings)
})

router.get('/:slug', async (req, res) => {
  const slug = String(req.params.slug ?? '').trim()
  if (!slug) {
    res.status(400).json({ error: 'Slug required' })
    return
  }
  const venue = await auth.getVenueBySlug(slug)
  if (!venue) {
    res.status(404).json({ error: 'Venue not found' })
    return
  }
  res.json({ slug: venue.slug, name: venue.name })
})

router.post('/', createVenueRateLimit, async (req, res) => {
  const { venueName, username, password, displayName } = parseCreateVenueBody(req.body)

  if (!venueName || !username || !password || !displayName) {
    res
      .status(400)
      .json({ error: 'Venue name, username, password, and display name are required' })
    return
  }

  const slug = slugifyVenueName(venueName)
  if (!slug) {
    res.status(400).json({ error: 'Venue name must contain letters or numbers' })
    return
  }

  const client = await getClient()
  try {
    await client.query('BEGIN')

    const venueInsert = await client.query<{ id: string; slug: string; name: string }>(
      `INSERT INTO ${DB.VENUES_TABLE} (slug, name)
       VALUES ($1, $2)
       RETURNING ${DB.ID_COLUMN}, slug, name`,
      [slug, venueName]
    )

    const venue = venueInsert.rows[0]
    await client.query(
      `INSERT INTO ${DB.USERS_TABLE}
       (username, password_hash, role, display_name, ${DB.VENUE_ID_COLUMN})
       VALUES ($1, $2, 'admin', $3, $4)`,
      [username, hashPassword(password), displayName, venue.id]
    )

    await client.query('COMMIT')
    res.status(201).json({
      redirectUrl: `/${venue.slug}/login`,
      venue: { slug: venue.slug, name: venue.name },
    })
  } catch (error) {
    await client.query('ROLLBACK')
    if (isUniqueViolation(error)) {
      res.status(409).json({ error: 'Venue slug or username already exists' })
      return
    }
    console.error('Failed to create venue', error)
    res.status(500).json({ error: 'Failed to create venue' })
  } finally {
    client.release()
  }
})

export default router
