import type { Request, Response, NextFunction } from 'express'

export function requireDevVenuesEnabled(_req: Request, res: Response, next: NextFunction): void {
  if (process.env.DEV_VENUES_ENABLED !== 'true') {
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
