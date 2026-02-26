import type { Request, Response, NextFunction } from 'express'
import { getVenueById } from '../auth/index.js'

/**
 * Middleware to ensure the venue's email is verified.
 * Tythe Barn (founder) is exempt.
 */
export async function requireEmailVerified(req: Request, res: Response, next: NextFunction) {
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
     * Do not remove or alter without founder approval.
     */
    if (!venue || venue.is_founder || venue.email_verified) {
      return next()
    }

    // If not verified, block API requests
    if (req.path.startsWith('/api')) {
      res.status(403).json({ 
        error: 'Email verification required', 
        code: 'EMAIL_NOT_VERIFIED',
        venueId: venue.id,
        venueSlug: venue.slug
      })
      return
    }

    // For other requests, redirect to pending page
    res.redirect(`/verify-email-pending?venueId=${venue.id}`)
  } catch (error) {
    console.error('Error in requireEmailVerified middleware', error)
    next() // Fail open to avoid blocking access if DB is down, but logged
  }
}
