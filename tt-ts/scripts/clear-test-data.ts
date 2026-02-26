/**
 * Clear test venues, users, time_entries, and audit_log.
 * Keeps only Tythe venues: tythe, tythebarn.
 *
 * Run from tt-ts: npx tsx scripts/clear-test-data.ts
 */
import 'dotenv/config'
import { getPool } from '../src/server/db/connection.js'
import { DB } from '../src/shared/constants.js'

const KEEP_SLUGS = ['tythe', 'tythebarn']

async function main() {
  const pool = getPool()
  const client = await pool.connect()

  try {
    const venueRes = await client.query<{ id: string; slug: string }>(
      `SELECT ${DB.ID_COLUMN} as id, slug FROM ${DB.VENUES_TABLE}
       WHERE LOWER(slug) = ANY($1::text[])`,
      [KEEP_SLUGS.map((s) => s.toLowerCase())]
    )
    const keepIds = venueRes.rows.map((r) => r.id)
    if (keepIds.length === 0) {
      console.log('No Tythe venues found. Nothing to keep.')
      return
    }
    console.log(`Keeping venues: ${venueRes.rows.map((r) => r.slug).join(', ')}`)

    const delAudit = await client.query(
      `DELETE FROM ${DB.AUDIT_LOG_TABLE}
       WHERE ${DB.VENUE_ID_COLUMN} IS NOT NULL
         AND ${DB.VENUE_ID_COLUMN} != ALL($1::uuid[])`,
      [keepIds]
    )
    console.log(`Deleted ${delAudit.rowCount ?? 0} audit_log rows`)

    const delEntries = await client.query(
      `DELETE FROM ${DB.TIME_ENTRIES_TABLE}
       WHERE ${DB.VENUE_ID_COLUMN} IS NOT NULL
         AND ${DB.VENUE_ID_COLUMN} != ALL($1::uuid[])`,
      [keepIds]
    )
    console.log(`Deleted ${delEntries.rowCount ?? 0} time_entries rows`)

    const delUsers = await client.query(
      `DELETE FROM ${DB.USERS_TABLE}
       WHERE ${DB.VENUE_ID_COLUMN} IS NOT NULL
         AND ${DB.VENUE_ID_COLUMN} != ALL($1::uuid[])`,
      [keepIds]
    )
    console.log(`Deleted ${delUsers.rowCount ?? 0} users`)

    const delVenues = await client.query(
      `DELETE FROM ${DB.VENUES_TABLE}
       WHERE ${DB.ID_COLUMN} != ALL($1::uuid[])`,
      [keepIds]
    )
    console.log(`Deleted ${delVenues.rowCount ?? 0} venues`)

    const sessionTable = process.env.SESSION_PG_TABLE?.trim() || 'user_sessions'
    const hasSessionTable = await client.query(
      `SELECT 1 FROM information_schema.tables
       WHERE table_schema = 'public' AND table_name = $1`,
      [sessionTable]
    )
    if (hasSessionTable.rows.length > 0) {
      await client.query(`TRUNCATE TABLE ${sessionTable}`)
      console.log(`Cleared ${sessionTable} (force re-login)`)
    }

    console.log('Done. Tythe data kept.')
  } finally {
    client.release()
    await pool.end()
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
