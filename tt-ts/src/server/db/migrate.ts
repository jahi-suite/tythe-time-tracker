/**
 * Run migrations on startup. Ensures time_entries.user_id exists
 * so tt-ts works without requiring the Python app to run first.
 */
import { getPool } from './connection.js'
import { DB } from '../../shared/constants.js'

export async function runMigrations(): Promise<void> {
  const pool = getPool()
  const client = await pool.connect()

  try {
    // Check if time_entries.user_id exists
    const colCheck = await client.query(
      `SELECT column_name FROM information_schema.columns
       WHERE table_name = $1 AND column_name = $2`,
      [DB.TIME_ENTRIES_TABLE, DB.USER_ID_COLUMN]
    )

    if (colCheck.rows.length === 0) {
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
    const fkCheck = await client.query(
      `SELECT 1 FROM pg_constraint c
       JOIN pg_class t ON t.oid = c.conrelid
       WHERE t.relname = $1 AND c.contype = 'f' AND c.conname = $2`,
      [DB.TIME_ENTRIES_TABLE, `${DB.TIME_ENTRIES_TABLE}_${DB.USER_ID_COLUMN}_fkey`]
    )

    if (fkCheck.rows.length === 0) {
      await client.query(
        `ALTER TABLE ${DB.TIME_ENTRIES_TABLE}
         ADD CONSTRAINT ${DB.TIME_ENTRIES_TABLE}_${DB.USER_ID_COLUMN}_fkey
         FOREIGN KEY (${DB.USER_ID_COLUMN})
         REFERENCES ${DB.USERS_TABLE} (${DB.ID_COLUMN})
         ON DELETE SET NULL`
      )
      console.log('[migrate] Added time_entries.user_id foreign key')
    }

    // Fix users with empty display_name (prevents "Unknown user")
    const fixUsers = await client.query(
      `UPDATE ${DB.USERS_TABLE}
       SET display_name = COALESCE(NULLIF(TRIM(username), ''), 'User')
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
