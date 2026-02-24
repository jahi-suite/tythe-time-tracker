import serverless from 'serverless-http'

import { createApp } from '../../src/server/index.js'

let appPromise: ReturnType<typeof createApp> | null = null

async function getApp() {
  if (!appPromise) {
    appPromise = createApp()
  }

  return appPromise
}

export const handler = async (event: unknown, context: unknown) => {
  const app = await getApp()
  return serverless(app)(event as never, context as never)
}
