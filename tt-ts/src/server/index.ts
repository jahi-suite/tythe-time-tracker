import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Tythe Time Tracker API' })
})

// Serve static client in production (dist is sibling of dist-server)
const distPath = path.join(path.dirname(__dirname), 'dist')
app.use(express.static(distPath))

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`)
})
