import type { AuthUser } from '../../shared/types.js'

declare module 'express-session' {
  interface SessionData {
    user?: AuthUser
    venue_id?: string
    venue_slug?: string
  }
}

export {}
