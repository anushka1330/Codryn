const dns = require('dns')
try {
  dns.setDefaultResultOrder('ipv4first')
} catch {}

const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// ── MIDDLEWARE ──────────────────────────────────────────────────────────────

// CORS — allow the Vite dev server
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    process.env.FRONTEND_URL,
  ].filter(Boolean),
  credentials: true,
}))

// Parse JSON bodies
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Request logger
app.use((req, _res, next) => {
  const ts = new Date().toISOString()
  console.log(`[${ts}] ${req.method} ${req.path}`)
  next()
})

// ── HEALTH CHECK ────────────────────────────────────────────────────────────

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'codryn-api',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  })
})

// ── ROUTES ──────────────────────────────────────────────────────────────────

// Lazy-load routes so a missing .env doesn't crash startup
try {
  app.use('/api/auth',         require('./routes/authRoutes'))
  app.use('/api/repositories', require('./routes/repositoryRoutes'))
  app.use('/api/repositories', require('./routes/analysisRoutes'))
  app.use('/api/repositories', require('./routes/chatRoutes'))
  app.use('/api/repositories', require('./routes/aiRoutes'))
} catch (err) {
  console.warn('[server] Route loading warning:', err.message)
}

// ── 404 HANDLER ─────────────────────────────────────────────────────────────

app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

// ── ERROR HANDLER ───────────────────────────────────────────────────────────

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('[server] Unhandled error:', err)
  const status = err.status || err.statusCode || 500
  res.status(status).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  })
})

// ── START ────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`\n🚀 Codryn API running on http://localhost:${PORT}`)
  console.log(`   Health: http://localhost:${PORT}/api/health\n`)
})

module.exports = app
