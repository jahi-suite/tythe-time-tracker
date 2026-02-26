import 'dotenv/config'

export interface DatabaseConfig {
  host: string
  database: string
  user: string
  password: string
  port: number
}

export function getDatabaseConfig(): DatabaseConfig {
  const host = process.env.SUPABASE_HOST
  const database = process.env.SUPABASE_DATABASE
  const user = process.env.SUPABASE_USER
  const password = process.env.SUPABASE_PASSWORD
  const portStr = process.env.SUPABASE_PORT ?? '5432'

  if (!host || !database || !user || !password) {
    throw new Error('Missing required database env: SUPABASE_HOST, SUPABASE_DATABASE, SUPABASE_USER, SUPABASE_PASSWORD')
  }

  const port = parseInt(portStr, 10)
  if (isNaN(port)) {
    throw new Error(`Invalid SUPABASE_PORT: ${portStr}`)
  }

  return { host, database, user, password, port }
}
