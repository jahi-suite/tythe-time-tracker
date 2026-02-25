import { Router } from 'express'
import type pg from 'pg'
import { DB } from '../../shared/constants.js'
import { hashPassword } from '../auth/index.js'
import { getClient, query } from '../db/connection.js'
import { createIpRateLimit } from '../middleware/rateLimit.js'

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
