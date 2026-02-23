import type { RequestHandler } from 'express'

type RateLimitOptions = {
  maxRequests: number
  windowMs: number
  message?: string
}

type RateLimitEntry = {
  count: number
  resetAt: number
}

const ipBuckets = new Map<string, RateLimitEntry>()

function getClientIpKey(ip: string | undefined): string {
  const value = ip?.trim()
  return value && value.length > 0 ? value : 'unknown'
}

export function createIpRateLimit(options: RateLimitOptions): RequestHandler {
  const message = options.message ?? 'Too many requests, please try again later'

  return (req, res, next) => {
    const now = Date.now()
    const key = `${req.baseUrl}${req.route?.path ?? req.path}:${getClientIpKey(req.ip)}`
    const existing = ipBuckets.get(key)

    if (!existing || existing.resetAt <= now) {
      ipBuckets.set(key, { count: 1, resetAt: now + options.windowMs })
      next()
      return
    }

    if (existing.count >= options.maxRequests) {
      const retryAfterSeconds = Math.max(1, Math.ceil((existing.resetAt - now) / 1000))
      res.setHeader('Retry-After', String(retryAfterSeconds))
      res.status(429).json({ error: message })
      return
    }

    existing.count += 1
    next()
  }
}
