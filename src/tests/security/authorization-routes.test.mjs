import test from 'node:test'
import assert from 'node:assert/strict'
import express from 'express'

import usersRouter from '../../dist-server/server/routes/users.js'
import exportRouter from '../../dist-server/server/routes/export.js'
import auditRouter from '../../dist-server/server/routes/audit.js'
import shiftsRouter from '../../dist-server/server/routes/shifts.js'

function createApp() {
  const app = express()
  app.use('/api/users', usersRouter)
  app.use('/api/export', exportRouter)
  app.use('/api/audit', auditRouter)
  app.use('/api/shifts', shiftsRouter)
  return app
}

async function requestJson(app, path, options = {}) {
  return await new Promise((resolve, reject) => {
    const req = {
      method: options.method ?? 'GET',
      url: path,
      originalUrl: path,
      headers: {},
      body: options.body,
      session: options.role
        ? {
            user: {
              id: 'test-user-id',
              username: `${options.role}-user`,
              display_name: `${options.role} user`,
              role: options.role,
            },
          }
        : {},
      app,
      socket: {},
      connection: {},
      get(name) {
        return this.headers[String(name).toLowerCase()]
      },
      header(name) {
        return this.get(name)
      },
    }

    const res = {
      statusCode: 200,
      headers: {},
      body: undefined,
      locals: {},
      headersSent: false,
      setHeader(name, value) {
        this.headers[String(name).toLowerCase()] = value
      },
      getHeader(name) {
        return this.headers[String(name).toLowerCase()]
      },
      status(code) {
        this.statusCode = code
        return this
      },
      json(payload) {
        this.body = payload
        this.headersSent = true
        this.setHeader('content-type', 'application/json')
        resolve({ status: this.statusCode, body: this.body })
        return this
      },
      send(payload) {
        this.body = payload
        this.headersSent = true
        resolve({ status: this.statusCode, body: this.body })
        return this
      },
      end(payload) {
        if (payload !== undefined) this.body = payload
        this.headersSent = true
        resolve({ status: this.statusCode, body: this.body })
        return this
      },
    }

    app.handle(req, res, (error) => {
      if (error) {
        reject(error)
        return
      }
      resolve({ status: res.statusCode, body: res.body })
    })
  })
}

test('unauthenticated requests are rejected on manager/auth routes', async () => {
  const app = createApp()
  const users = await requestJson(app, '/api/users')
  assert.equal(users.status, 401)

  const exportExcel = await requestJson(app, '/api/export/excel')
  assert.equal(exportExcel.status, 401)
})

test('employee role is forbidden from manager-only audit and shift routes', async () => {
  const app = createApp()
  const audit = await requestJson(app, '/api/audit', { role: 'employee' })
  assert.equal(audit.status, 403)

  const shift = await requestJson(app, '/api/shifts/shift-123', { role: 'employee' })
  assert.equal(shift.status, 403)
})

test('manager role cannot access admin-only pay-rates endpoint', async () => {
  const app = createApp()
  const response = await requestJson(app, '/api/users/target-user/pay-rates', {
    method: 'POST',
    role: 'manager',
    body: { standard: 12.34, enhanced: 15.67, supervisor: 20 },
  })

  assert.equal(response.status, 403)
  assert.deepEqual(response.body, { error: 'Admin role required' })
})
