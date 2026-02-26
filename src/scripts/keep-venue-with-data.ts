/**
 * Keep only the Tythe venue that has data (users or time_entries).
 * Deletes the empty one.
 *
 * Run from tt-ts: npx tsx scripts/keep-venue-with-data.ts
 */
import 'dotenv/config'
import { getPool } from '../src/server/db/connection.js'
import { DB } from '../src/shared/constants.js'

const CANDIDATE_SLUGS = ['tythe', 'tythebarn']

async function main() {
  const pool = getPool()
  const client = await pool.connect()

  try {
    const venueRes = await client.query<{
      id: string
      slug: string
      name: string
      user_count: string
      entry_count: string
    }>(
      `SELECT v.${DB.ID_COLUMN} as id, v.slug, v.name,
              (SELECT COUNT(*) FROM ${DB.USERS_TABLE} u WHERE u.${DB.VENUE_ID_COLUMN} = v.${DB.ID_COLUMN}) AS user_count,
              (SELECT COUNT(*) FROM ${DB.TIME_ENTRIES_TABLE} te WHERE te.${DB.VENUE_ID_COLUMN} = v.${DB.ID_COLUMN}) AS entry_count
       FROM ${DB.VENUES_TABLE} v
       WHERE LOWER(v.slug) = ANY($1::text[])`,
      [CANDIDATE_SLUGS.map((s) => s.toLowerCase())]
    )

    if (venueRes.rows.length === 0) {
      console.log('No Tythe venues found.')
      return
    }

    for (const v of venueRes.rows) {
      const users = parseInt(v.user_count, 10)
      const entries = parseInt(v.entry_count, 10)
      console.log(`${v.slug} (${v.name}): ${users} users, ${entries} time entries`)
    }

    const withData = venueRes.rows.filter(
      (v) => parseInt(v.user_count, 10) > 0 || parseInt(v.entry_count, 10) > 0
    )
    const empty = venueRes.rows.filter(
      (v) => parseInt(v.user_count, 10) === 0 && parseInt(v.entry_count, 10) === 0
    )

    if (withData.length === 0) {
      console.log('Neither venue has data. Keeping tythebarn, removing tythe.')
      const keepSlug = 'tythebarn'
      const deleteSlug = 'tythe'
      await deleteVenue(client, venueRes.rows.find((r) => r.slug === deleteSlug)?.id)
      console.log(`Deleted ${deleteSlug}. Use /${keepSlug} to log in.`)
      return
    }

    const keepId = withData[0].id
    const keepSlug = withData[0].slug

    for (const v of empty) {
      await deleteVenue(client, v.id)
      console.log(`Deleted empty venue: ${v.slug} (${v.name})`)
    }

    const sessionTable = process.env.SESSION_PG_TABLE?.trim() || 'user_sessions'
    const hasSessionTable = await client.query(
      `SELECT 1 FROM information_schema.tables
       WHERE table_schema = 'public' AND table_name = $1`,
      [sessionTable]
    )
    if (hasSessionTable.rows.length > 0) {
      await client.query(`TRUNCATE TABLE ${sessionTable}`)
      console.log('Cleared sessions (re-login required)')
    }

    console.log(`Done. Kept ${keepSlug}. Log in at /${keepSlug}`)
  } finally {
    client.release()
    await pool.end()
  }
}

async function deleteVenue(client: { query: (q: string, p?: unknown[]) => Promise<{ rowCount?: number }> }, venueId: string | undefined) {
  if (!venueId) return
  await client.query(
    `DELETE FROM ${DB.AUDIT_LOG_TABLE} WHERE ${DB.VENUE_ID_COLUMN} = $1`,
    [venueId]
  )
  await client.query(
    `DELETE FROM ${DB.TIME_ENTRIES_TABLE} WHERE ${DB.VENUE_ID_COLUMN} = $1`,
    [venueId]
  )
  await client.query(
    `DELETE FROM ${DB.USERS_TABLE} WHERE ${DB.VENUE_ID_COLUMN} = $1`,
    [venueId]
  )
  await client.query(
    `DELETE FROM ${DB.VENUES_TABLE} WHERE ${DB.ID_COLUMN} = $1`,
    [venueId]
  )
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
