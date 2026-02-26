import type { Request, Response, NextFunction } from 'express'
import { getVenueById } from '../auth/index.js'

/**
 * Middleware that allows unverified venues through (pass-through).
 * This maintains the function signature while implementing the fallback strategy.
 */
export async function requireEmailVerified(_req: Request, _res: Response, next: NextFunction) {
  next()
}

/**
 * Middleware to ensure the venue's email is verified for manager actions.
 * Tythe Barn (founder) is exempt.
 */
export async function requireEmailVerifiedForManager(req: Request, res: Response, next: NextFunction) {
  const user = req.session?.user
  const venueId = req.session?.venue_id

  if (!user || !venueId) {
    return next() // Handled by requireAuth
  }

  try {
    const venue = await getVenueById(venueId)
    
    /*
     * Tythe Barn is the founding test partner.
     * This venue is permanently exempt from verification and subscription restrictions.
     */
    if (!venue || venue.is_founder || venue.email_verified) {
      return next()
    }

    // Only block if the user is a manager or admin
    if (user.role === 'manager' || user.role === 'admin') {
      res.status(403).json({ 
        error: 'Manager actions require email verification', 
        code: 'EMAIL_NOT_VERIFIED',
        venueId: venue.id,
        venueSlug: venue.slug
      })
      return
    }

    next()
  } catch (error) {
    console.error('Error in requireEmailVerifiedForManager middleware', error)
    next() // Fail open to avoid blocking access if DB is down, but logged
  }
}
