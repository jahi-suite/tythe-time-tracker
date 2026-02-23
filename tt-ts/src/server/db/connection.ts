import pg from 'pg'
import { getDatabaseConfig } from '../config/settings.js'

const { Pool } = pg

let pool: pg.Pool | null = null

export function getPool(): pg.Pool {
  if (!pool) {
    const config = getDatabaseConfig()
    pool = new Pool({
      host: config.host,
      database: config.database,
      user: config.user,
      password: config.password,
      port: config.port,
      ssl: { rejectUnauthorized: false },
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
