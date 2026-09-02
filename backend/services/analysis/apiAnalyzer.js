'use strict'

/**
 * Detect likely API routes from source files.
 */
function analyzeAPIs(files) {
  const routes = []

  // Express/Fastify/Koa route patterns
  const ROUTE_PATTERNS = [
    // Express: router.get('/path', ...) or app.get('/path', ...)
    /(?:router|app)\.(get|post|put|patch|delete|options|head)\s*\(\s*['"`]([^'"`\s]+)['"`]/gi,
    // Next.js API handlers
    /export\s+(?:default\s+)?(?:async\s+)?function\s+handler/gi,
    // FastAPI/Flask: @app.route, @router.get
    /@(?:app|router|blueprint)\.(?:get|post|put|patch|delete|route)\s*\(\s*['"]([^'"]+)['"]/gi,
  ]

  for (const file of files) {
    if (!file.content) continue

    // Only look in likely API files
    const isApiFile = /routes?|controllers?|api|handlers?/i.test(file.path)
    if (!isApiFile) continue

    let match
    for (const pattern of ROUTE_PATTERNS) {
      pattern.lastIndex = 0
      while ((match = pattern.exec(file.content)) !== null) {
        const method = match[1]?.toUpperCase()
        const path   = match[2]

        if (path && method) {
          routes.push({
            method,
            path,
            file:   file.path,
            line:   getLineNumber(file.content, match.index),
          })
        }
      }
    }

    // Next.js route files (app router)
    if (file.path.includes('/api/') && /route\.(ts|js)$/.test(file.path)) {
      const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
      for (const method of methods) {
        if (new RegExp(`export\\s+(?:async\\s+)?function\\s+${method}\\b`).test(file.content)) {
          const routePath = file.path
            .replace(/^.*\/app/, '')
            .replace(/\/route\.(ts|js)$/, '')
          routes.push({ method, path: routePath || '/', file: file.path, line: null })
        }
      }
    }
  }

  // Deduplicate
  const seen = new Set()
  const unique = routes.filter(r => {
    const key = `${r.method}:${r.path}:${r.file}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  return {
    routes: unique.slice(0, 100), // Cap at 100
    total:  unique.length,
    files:  [...new Set(routes.map(r => r.file))],
  }
}

function getLineNumber(content, index) {
  return content.substring(0, index).split('\n').length
}

module.exports = { analyzeAPIs }
