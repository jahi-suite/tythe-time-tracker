/**
 * Session cookie options — shared between session middleware and logout clearCookie.
 * Must match exactly so the browser clears the cookie.
 */
export function getSessionCookieOptions(): {
  path: string
  httpOnly: boolean
  sameSite: 'lax' | 'strict' | 'none'
  secure: boolean
} {
  return {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  }
}
