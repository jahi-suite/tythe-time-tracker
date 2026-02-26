import type { Request, Response, NextFunction } from 'express'

function isLocalhost(req: Request): boolean {
  const host = (req.hostname || req.get('host') || '').split(':')[0].toLowerCase()
  return host === 'localhost' || host === '127.0.0.1' || host === '::1'
}

export function requireDevVenuesEnabled(req: Request, res: Response, next: NextFunction): void {
  if (process.env.DEV_VENUES_ENABLED !== 'true') {
    res.status(404).json({ error: 'Not found' })
    return
  }
  if (!isLocalhost(req)) {
    res.status(404).json({ error: 'Not found' })
    return
  }

  next()
}

export function requireDevSecret(req: Request, res: Response, next: NextFunction): void {
  const configuredSecret = process.env.DEV_SECRET?.trim()
  if (!configuredSecret) {
    next()
    return
  }

  const headerSecret = req.get('X-Dev-Secret')?.trim()
  const cookieSecret =
    typeof req.cookies?.dev_secret === 'string' ? req.cookies.dev_secret.trim() : undefined

  if (headerSecret !== configuredSecret && cookieSecret !== configuredSecret) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  next()
}
