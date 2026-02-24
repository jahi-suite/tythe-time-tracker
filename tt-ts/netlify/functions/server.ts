import serverless from 'serverless-http'

let appPromise: Promise<Awaited<ReturnType<typeof import('../../src/server/index.js')['createApp']>>> | null = null

async function getApp() {
  if (!appPromise) {
    const { createApp } = await import('../../src/server/index.js')
    appPromise = createApp()
  }
  return appPromise
}

export const handler = async (event: unknown, context: unknown) => {
  const app = await getApp()
  return serverless(app)(event as never, context as never)
}
