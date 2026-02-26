import pg from 'pg'
import { getDatabaseConfig } from '../config/settings.js'

const { Pool } = pg

let pool: pg.Pool | null = null

function getSslRejectUnauthorized(): boolean {
  const raw = process.env.DB_SSL_REJECT_UNAUTHORIZED?.trim().toLowerCase()

  if (!raw) {
    return false
  }

  if (raw === 'true') {
    return true
  }

  if (raw === 'false') {
    return false
  }

  throw new Error('Invalid DB_SSL_REJECT_UNAUTHORIZED: expected "true" or "false"')
}

export function getPool(): pg.Pool {
  if (!pool) {
    const config = getDatabaseConfig()
    pool = new Pool({
      host: config.host,
      database: config.database,
      user: config.user,
      password: config.password,
      port: config.port,
      ssl: { rejectUnauthorized: getSslRejectUnauthorized() },
    })
  }
  return pool
}

export async function getClient(): Promise<pg.PoolClient> {
  return getPool().connect()
}

export async function query<T extends pg.QueryResultRow = pg.QueryResultRow>(
  text: string,
  params?: unknown[]
): Promise<pg.QueryResult<T>> {
  const client = await getClient()
  try {
    return await client.query<T>(text, params)
  } finally {
    client.release()
  }
}
