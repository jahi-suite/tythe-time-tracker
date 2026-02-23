import type { AuthUser } from '../../shared/types.js'

declare module 'express-session' {
  interface SessionData {
    user?: AuthUser
  }
}

export {}
