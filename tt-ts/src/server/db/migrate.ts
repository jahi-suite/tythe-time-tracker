/**
 * Run migrations on startup. Ensures time_entries.user_id exists
 * and adds multi-venue foundation (venues table + venue_id backfills)
 * so tt-ts works without requiring the Python app to run first.
 */
import type pg from 'pg'
import { getPool } from './connection.js'
import { DB } from '../../shared/constants.js'

const DEFAULT_VENUE_SLUG = 'tythe'
const DEFAULT_VENUE_NAME = 'Tythe'
type DbClient = pg.PoolClient

async function tableExists(
  client: DbClient,
  tableName: string
): Promise<boolean> {
  const res = await client.query(
    `SELECT 1 FROM information_schema.tables
     WHERE table_schema = 'public' AND table_name = $1`,
    [tableName]
  )
  return res.rows.length > 0
}

async function columnExists(
  client: DbClient,
  tableName: string,
  columnName: string
): Promise<boolean> {
  const res = await client.query(
    `SELECT 1 FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = $1 AND column_name = $2`,
    [tableName, columnName]
  )
  return res.rows.length > 0
}

async function foreignKeyExists(
  client: DbClient,
  tableName: string,
  constraintName: string
): Promise<boolean> {
  const res = await client.query(
    `SELECT 1 FROM pg_constraint c
     JOIN pg_class t ON t.oid = c.conrelid
     WHERE t.relname = $1 AND c.contype = 'f' AND c.conname = $2`,
    [tableName, constraintName]
  )
  return res.rows.length > 0
}

async function ensureVenueSchema(
  client: DbClient
): Promise<string> {
  await client.query(
    `CREATE TABLE IF NOT EXISTS ${DB.VENUES_TABLE} (
     ${DB.ID_COLUMN} UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     slug TEXT NOT NULL UNIQUE,
     name TEXT NOT NULL,
     active BOOLEAN NOT NULL DEFAULT TRUE,
     ${DB.CREATED_AT_COLUMN} TIMESTAMPTZ NOT NULL DEFAULT NOW()
     )`
  )

  await client.query(
    `INSERT INTO ${DB.VENUES_TABLE} (slug, name)
     VALUES ($1, $2)
     ON CONFLICT (slug) DO NOTHING`,
    [DEFAULT_VENUE_SLUG, DEFAULT_VENUE_NAME]
  )

  const venueRes = await client.query<{ id: string }>(
    `SELECT ${DB.ID_COLUMN}
     FROM ${DB.VENUES_TABLE}
     WHERE slug = $1
     LIMIT 1`,
    [DEFAULT_VENUE_SLUG]
  )

  if (!venueRes.rows[0]?.id) {
    throw new Error('Failed to ensure default Tythe venue')
  }

  return venueRes.rows[0].id
}

async function ensureVenueActiveColumn(client: DbClient): Promise<void> {
  // Ensure venues.active exists for soft deactivation.
  if (!(await columnExists(client, DB.VENUES_TABLE, 'active'))) {
    await client.query(
      `ALTER TABLE ${DB.VENUES_TABLE}
       ADD COLUMN active BOOLEAN NOT NULL DEFAULT TRUE`
    )
    console.log(`[migrate] Added ${DB.VENUES_TABLE}.active column`)
    return
  }

  const backfillRes = await client.query(
    `UPDATE ${DB.VENUES_TABLE}
     SET active = TRUE
     WHERE active IS NULL`
  )
  if ((backfillRes.rowCount ?? 0) > 0) {
    console.log(
      `[migrate] Backfilled ${backfillRes.rowCount} ${DB.VENUES_TABLE} row(s) with active=true`
    )
  }
}

async function ensureVenueSettingsColumns(client: DbClient): Promise<void> {
  const venueSettingsColumns = [
    {
      name: 'enhanced_enabled',
      type: 'BOOLEAN NOT NULL DEFAULT TRUE',
    },
    {
      name: 'enhanced_start_hour',
      type: 'INTEGER NOT NULL DEFAULT 19',
    },
    {
      name: 'enhanced_end_hour',
      type: 'INTEGER NOT NULL DEFAULT 4',
    },
    {
      name: 'break_deduct_enabled',
      type: 'BOOLEAN NOT NULL DEFAULT TRUE',
    },
    {
      name: 'break_deduct_minutes',
      type: 'INTEGER NOT NULL DEFAULT 20',
    },
    {
      name: 'break_threshold_hours',
      type: 'NUMERIC(5,2) NOT NULL DEFAULT 6',
    },
    {
      name: 'supervisor_enabled',
      type: 'BOOLEAN NOT NULL DEFAULT TRUE',
    },
    {
      name: 'supervisor_label',
      type: "TEXT NOT NULL DEFAULT 'Supervisor'",
    },
    {
      name: 'supervisor_deduct_break',
      type: 'BOOLEAN NOT NULL DEFAULT TRUE',
    },
  ] as const

  for (const column of venueSettingsColumns) {
    if (await columnExists(client, DB.VENUES_TABLE, column.name)) continue

    await client.query(
      `ALTER TABLE ${DB.VENUES_TABLE}
       ADD COLUMN ${column.name} ${column.type}`
    )
    console.log(`[migrate] Added ${DB.VENUES_TABLE}.${column.name} column`)
  }

  const backfillRes = await client.query(
    `UPDATE ${DB.VENUES_TABLE}
     SET enhanced_enabled = COALESCE(enhanced_enabled, TRUE),
         enhanced_start_hour = COALESCE(enhanced_start_hour, 19),
         enhanced_end_hour = COALESCE(enhanced_end_hour, 4),
         break_deduct_enabled = COALESCE(break_deduct_enabled, TRUE),
         break_deduct_minutes = COALESCE(break_deduct_minutes, 20),
         break_threshold_hours = COALESCE(break_threshold_hours, 6),
         supervisor_enabled = COALESCE(supervisor_enabled, TRUE),
         supervisor_label = COALESCE(NULLIF(TRIM(supervisor_label), ''), 'Supervisor'),
         supervisor_deduct_break = COALESCE(supervisor_deduct_break, TRUE)
     WHERE enhanced_enabled IS NULL
        OR enhanced_start_hour IS NULL
        OR enhanced_end_hour IS NULL
        OR break_deduct_enabled IS NULL
        OR break_deduct_minutes IS NULL
        OR break_threshold_hours IS NULL
        OR supervisor_enabled IS NULL
        OR supervisor_label IS NULL
        OR TRIM(supervisor_label) = ''
        OR supervisor_deduct_break IS NULL`
  )
  if ((backfillRes.rowCount ?? 0) > 0) {
    console.log(
      `[migrate] Backfilled ${backfillRes.rowCount} ${DB.VENUES_TABLE} row(s) with venue settings defaults`
    )
  }
}

async function ensureVenueColumnIndexAndFk(
  client: DbClient,
  tableName: string,
  onDelete: 'RESTRICT' | 'SET NULL' = 'RESTRICT'
): Promise<void> {
  if (!(await tableExists(client, tableName))) return

  if (!(await columnExists(client, tableName, DB.VENUE_ID_COLUMN))) {
    await client.query(
      `ALTER TABLE ${tableName}
       ADD COLUMN ${DB.VENUE_ID_COLUMN} UUID NULL`
    )
    console.log(`[migrate] Added ${tableName}.${DB.VENUE_ID_COLUMN} column`)
  }

  await client.query(
    `CREATE INDEX IF NOT EXISTS idx_${tableName}_${DB.VENUE_ID_COLUMN}
     ON ${tableName} (${DB.VENUE_ID_COLUMN})`
  )

  const fkName = `${tableName}_${DB.VENUE_ID_COLUMN}_fkey`
  if (!(await foreignKeyExists(client, tableName, fkName))) {
    await client.query(
      `ALTER TABLE ${tableName}
       ADD CONSTRAINT ${fkName}
       FOREIGN KEY (${DB.VENUE_ID_COLUMN})
       REFERENCES ${DB.VENUES_TABLE} (${DB.ID_COLUMN})
       ON DELETE ${onDelete}`
    )
    console.log(`[migrate] Added ${tableName}.${DB.VENUE_ID_COLUMN} foreign key`)
  }
}

export async function runMigrations(): Promise<void> {
  const pool = getPool()
  const client = await pool.connect()

  try {
    const defaultVenueId = await ensureVenueSchema(client)
    await ensureVenueActiveColumn(client)
    await ensureVenueSettingsColumns(client)

    await ensureVenueColumnIndexAndFk(client, DB.USERS_TABLE)
    await ensureVenueColumnIndexAndFk(client, DB.TIME_ENTRIES_TABLE)
    await ensureVenueColumnIndexAndFk(client, DB.AUDIT_LOG_TABLE)

    for (const tableName of [DB.USERS_TABLE, DB.TIME_ENTRIES_TABLE, DB.AUDIT_LOG_TABLE]) {
      if (!(await tableExists(client, tableName))) continue
      if (!(await columnExists(client, tableName, DB.VENUE_ID_COLUMN))) continue

      const backfillRes = await client.query(
        `UPDATE ${tableName}
         SET ${DB.VENUE_ID_COLUMN} = $1
         WHERE ${DB.VENUE_ID_COLUMN} IS NULL`,
        [defaultVenueId]
      )
      if ((backfillRes.rowCount ?? 0) > 0) {
        console.log(
          `[migrate] Backfilled ${backfillRes.rowCount} ${tableName} row(s) with default venue`
        )
      }
    }

    // Check if time_entries.user_id exists
    if (!(await columnExists(client, DB.TIME_ENTRIES_TABLE, DB.USER_ID_COLUMN))) {
      await client.query(
        `ALTER TABLE ${DB.TIME_ENTRIES_TABLE}
         ADD COLUMN ${DB.USER_ID_COLUMN} UUID NULL`
      )
      console.log('[migrate] Added time_entries.user_id column')
    }

    // Index for user_id lookups
    await client.query(
      `CREATE INDEX IF NOT EXISTS idx_${DB.TIME_ENTRIES_TABLE}_${DB.USER_ID_COLUMN}
       ON ${DB.TIME_ENTRIES_TABLE} (${DB.USER_ID_COLUMN})`
    )

    // Foreign key if not exists
    if (
      !(await foreignKeyExists(
        client,
        DB.TIME_ENTRIES_TABLE,
        `${DB.TIME_ENTRIES_TABLE}_${DB.USER_ID_COLUMN}_fkey`
      ))
    ) {
      await client.query(
        `ALTER TABLE ${DB.TIME_ENTRIES_TABLE}
         ADD CONSTRAINT ${DB.TIME_ENTRIES_TABLE}_${DB.USER_ID_COLUMN}_fkey
         FOREIGN KEY (${DB.USER_ID_COLUMN})
         REFERENCES ${DB.USERS_TABLE} (${DB.ID_COLUMN})
         ON DELETE SET NULL`
      )
      console.log('[migrate] Added time_entries.user_id foreign key')
    }

    // Fix audit_log: NULL out venue_id for rows that were incorrectly backfilled
    // (backfill set all NULL to Tythe; rows where target user/entry is in another venue should be NULL)
    const fixAuditUserVenue = await client.query(
      `UPDATE ${DB.AUDIT_LOG_TABLE} a
       SET ${DB.VENUE_ID_COLUMN} = NULL
       FROM ${DB.USERS_TABLE} u
       WHERE a.target_table = $1
         AND a.target_id = u.${DB.ID_COLUMN}
         AND a.${DB.VENUE_ID_COLUMN} IS NOT NULL
         AND u.${DB.VENUE_ID_COLUMN} IS NOT NULL
         AND a.${DB.VENUE_ID_COLUMN} != u.${DB.VENUE_ID_COLUMN}`,
      [DB.USERS_TABLE]
    )
    if (fixAuditUserVenue.rowCount && fixAuditUserVenue.rowCount > 0) {
      console.log(`[migrate] Fixed ${fixAuditUserVenue.rowCount} audit_log row(s) with mismatched user venue`)
    }
    const fixAuditEntryVenue = await client.query(
      `UPDATE ${DB.AUDIT_LOG_TABLE} a
       SET ${DB.VENUE_ID_COLUMN} = NULL
       FROM ${DB.TIME_ENTRIES_TABLE} te
       WHERE a.target_table = $1
         AND a.target_id = te.${DB.ID_COLUMN}
         AND a.${DB.VENUE_ID_COLUMN} IS NOT NULL
         AND te.${DB.VENUE_ID_COLUMN} IS NOT NULL
         AND a.${DB.VENUE_ID_COLUMN} != te.${DB.VENUE_ID_COLUMN}`,
      [DB.TIME_ENTRIES_TABLE]
    )
    if (fixAuditEntryVenue.rowCount && fixAuditEntryVenue.rowCount > 0) {
      console.log(`[migrate] Fixed ${fixAuditEntryVenue.rowCount} audit_log row(s) with mismatched time_entry venue`)
    }

    // Fix users with empty display_name (prevents "Unknown user")
    const fixUsers = await client.query(
      `UPDATE ${DB.USERS_TABLE}
       SET display_name = COALESCE(NULLIF(TRIM(display_name), ''), NULLIF(TRIM(username), ''), 'User')
       WHERE display_name IS NULL OR TRIM(display_name) = ''`
    )
    if (fixUsers.rowCount && fixUsers.rowCount > 0) {
      console.log(`[migrate] Fixed ${fixUsers.rowCount} user(s) with empty display_name/username`)
    }

    // Backfill user_id from display_name where only one user has that name
    await client.query(
      `WITH unique_display_users AS (
         SELECT LOWER(TRIM(${DB.DISPLAY_NAME_COLUMN})) AS display_key,
                (array_agg(${DB.ID_COLUMN}))[1] AS user_id
         FROM ${DB.USERS_TABLE}
         GROUP BY LOWER(TRIM(${DB.DISPLAY_NAME_COLUMN}))
         HAVING COUNT(*) = 1
       )
       UPDATE ${DB.TIME_ENTRIES_TABLE} te
       SET ${DB.USER_ID_COLUMN} = u.user_id
       FROM unique_display_users u
       WHERE te.${DB.USER_ID_COLUMN} IS NULL
         AND LOWER(TRIM(te.${DB.EMPLOYEE_COLUMN})) = u.display_key`
    )
  } finally {
    client.release()
  }
}
