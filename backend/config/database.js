'use strict'

const mysql = require('mysql2/promise')

// ── CONNECTION POOL ──────────────────────────────────────────────────────────

let pool = null

/**
 * Get (or create) the MySQL connection pool.
 * Uses environment variables for all credentials.
 */
function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host:               process.env.DB_HOST     || 'localhost',
      port:     parseInt(process.env.DB_PORT      || '3306', 10),
      user:               process.env.DB_USER     || 'root',
      password:           process.env.DB_PASSWORD || '',
      database:           process.env.DB_NAME     || 'codryn',
      waitForConnections: true,
      connectionLimit:    10,
      queueLimit:         0,
      enableKeepAlive:    true,
      keepAliveInitialDelay: 0,
      // Parse JSON columns automatically
      typeCast(field, next) {
        if (field.type === 'JSON') {
          const val = field.string('utf8')
          try { return val ? JSON.parse(val) : null } catch { return val }
        }
        return next()
      },
    })

    pool.on('connection', () => {
      console.log('[db] New MySQL connection established')
    })
  }
  return pool
}

// ── HELPERS ──────────────────────────────────────────────────────────────────

/**
 * Run a query and return rows.
 * @param {string} sql
 * @param {Array}  params
 * @returns {Promise<Array>}
 */
async function query(sql, params = []) {
  const db = getPool()
  const [rows] = await db.execute(sql, params)
  return rows
}

/**
 * Run a query and return the first row.
 * @param {string} sql
 * @param {Array}  params
 * @returns {Promise<Object|null>}
 */
async function queryOne(sql, params = []) {
  const rows = await query(sql, params)
  return rows[0] || null
}

/**
 * Run an INSERT/UPDATE/DELETE and return the result metadata.
 * @returns {Promise<{insertId, affectedRows, changedRows}>}
 */
async function execute(sql, params = []) {
  const db = getPool()
  const [result] = await db.execute(sql, params)
  return result
}

/**
 * Test the database connection.
 */
async function testConnection() {
  try {
    await query('SELECT 1')
    console.log('[db] ✅ MySQL connection successful')
    return true
  } catch (err) {
    console.error('[db] ❌ MySQL connection failed:', err.message)
    return false
  }
}

/**
 * Initialize the database — create tables if they don't exist.
 */
async function initializeDatabase() {
  const fs = require('fs')
  const path = require('path')
  const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql')

  if (!fs.existsSync(schemaPath)) {
    console.warn('[db] schema.sql not found — skipping initialization')
    return
  }

  const schema = fs.readFileSync(schemaPath, 'utf8')
  // Split by semicolon and execute each statement
  const statements = schema
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'))

  const db = getPool()
  for (const stmt of statements) {
    try {
      await db.execute(stmt)
    } catch (err) {
      // Ignore "table already exists" errors
      if (err.code !== 'ER_TABLE_EXISTS_ERROR') {
        console.warn('[db] Schema warning:', err.message)
      }
    }
  }
  console.log('[db] ✅ Database schema initialized')
}

module.exports = { getPool, query, queryOne, execute, testConnection, initializeDatabase }
