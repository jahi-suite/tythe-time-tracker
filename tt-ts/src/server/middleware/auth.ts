import type { Request, Response, NextFunction } from 'express'

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const user = req.session?.user
  if (!user) {
    res.status(401).json({ error: 'Session expired or invalid. Please log in again.' })
    return
  }
  next()
}

export function requireManager(req: Request, res: Response, next: NextFunction): void {
  const user = req.session?.user
  if (!user) {
    res.status(401).json({ error: 'Session expired or invalid. Please log in again.' })
    return
  }
  if (user.role !== 'manager' && user.role !== 'admin') {
    res.status(403).json({ error: 'Manager or admin role required' })
    return
  }
  next()
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const user = req.session?.user
  if (!user) {
    res.status(401).json({ error: 'Session expired or invalid. Please log in again.' })
    return
  }
  if (user.role !== 'admin') {
    res.status(403).json({ error: 'Admin role required' })
    return
  }
  next()
}
