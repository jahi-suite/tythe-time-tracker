import serverless from 'serverless-http'

import { createApp } from '../../src/server/index.js'

let appPromise: ReturnType<typeof createApp> | null = null

async function getApp() {
  if (!appPromise) {
    appPromise = createApp()
  }

  return appPromise
}

function isDebugOrHealthPath(ev: unknown): boolean {
  const e = ev as { path?: string; rawUrl?: string }
  const path = e.path ?? e.rawUrl ?? ''
  return path.includes('/api/debug') || path.includes('/api/health')
}

function jsonResponse(statusCode: number, body: object) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }
}

export const handler = async (event: unknown, context: unknown) => {
  try {
    const app = await getApp()
    return serverless(app)(event as never, context as never)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    const stack = err instanceof Error ? err.stack : undefined
    console.error('[handler] startup failed:', msg, stack)
    const diagnostic = {
      error: 'startup_failed',
      message: msg,
      hint: 'Check Netlify env: SESSION_SECRET, SUPABASE_* (use port 6543 for pooler), NODE_ENV=production',
    }
    if (isDebugOrHealthPath(event)) {
      return jsonResponse(200, diagnostic)
    }
    return jsonResponse(502, diagnostic)
  }
}
