import type { Request, Response, NextFunction } from 'express'

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

function getRequestOrigin(req: Request): string | null {
  const originHeader = req.get('origin')?.trim()
  if (originHeader) {
    return originHeader
  }

  const refererHeader = req.get('referer')?.trim()
  if (!refererHeader) {
    return null
  }

  try {
    return new URL(refererHeader).origin
  } catch {
    return null
  }
}

export function requireSameOriginForMutations(req: Request, res: Response, next: NextFunction): void {
  if (!MUTATING_METHODS.has(req.method.toUpperCase())) {
    next()
    return
  }

  const host = req.get('host')?.trim()
  const requestOrigin = getRequestOrigin(req)
  if (!host || !requestOrigin) {
    res.status(403).json({ error: 'Origin or Referer header required for state-changing requests' })
    return
  }

  const forwardedProto = req.get('x-forwarded-proto')?.split(',')[0]?.trim()
  const protocol = forwardedProto || req.protocol
  const allowedOrigins = new Set([`${protocol}://${host}`, `https://${host}`, `http://${host}`])

  // In development, allow Vite dev server origin (different port) when API is on localhost
  const isDev = process.env.NODE_ENV !== 'production'
  if (isDev && requestOrigin.startsWith('http://localhost:') && host.startsWith('localhost')) {
    allowedOrigins.add(requestOrigin)
  }

  if (!allowedOrigins.has(requestOrigin)) {
    res.status(403).json({ error: 'Invalid request origin' })
    return
  }

  next()
}
