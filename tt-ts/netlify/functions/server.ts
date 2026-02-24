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
    console.error('[handler] startup failed:', msg)
    return jsonResponse(200, {
      error: 'startup_failed',
      message: msg,
      hint: 'Check Netlify function logs and env: SESSION_SECRET, SUPABASE_* (port 6543), NODE_ENV=production',
    })
  }
}
