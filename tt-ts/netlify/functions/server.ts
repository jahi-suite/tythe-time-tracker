import serverless from 'serverless-http'

let appPromise: Promise<Awaited<ReturnType<typeof import('../../src/server/index.js')['createApp']>>> | null = null

async function getApp() {
  if (!appPromise) {
    const { createApp } = await import('../../src/server/index.js')
    appPromise = createApp()
  }
  return appPromise
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
    return jsonResponse(200, diagnostic)
  }
}
