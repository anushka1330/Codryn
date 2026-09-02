'use strict'

/**
 * Detect authentication patterns from source files.
 */
function analyzeAuth(files) {
  const result = {
    providers:   [],
    patterns:    [],
    files:       [],
    middleware:  [],
  }

  const allContent = files.map(f => f.content || '').join('\n')
  const allPaths   = files.map(f => f.path)

  // ── PROVIDERS ──
  const providerChecks = [
    { pattern: /passport\.use\(/i,                   name: 'Passport.js' },
    { pattern: /GoogleStrategy|google.*strategy/i,   name: 'Google OAuth' },
    { pattern: /GitHubStrategy|github.*strategy/i,   name: 'GitHub OAuth' },
    { pattern: /FacebookStrategy/i,                  name: 'Facebook OAuth' },
    { pattern: /jwt\.sign|jsonwebtoken/i,             name: 'JWT' },
    { pattern: /bcrypt|argon2/i,                     name: 'Password hashing' },
    { pattern: /next-auth|NextAuth/i,                name: 'NextAuth.js' },
    { pattern: /clerk\.com|@clerk/i,                 name: 'Clerk' },
    { pattern: /auth0\.com|@auth0/i,                 name: 'Auth0' },
    { pattern: /supabase.*auth|auth\.supabase/i,     name: 'Supabase Auth' },
    { pattern: /firebase.*auth|getAuth\(\)/i,        name: 'Firebase Auth' },
    { pattern: /express-session/i,                   name: 'Express Session' },
    { pattern: /cookie-session/i,                    name: 'Cookie Session' },
  ]

  for (const { pattern, name } of providerChecks) {
    if (pattern.test(allContent) && !result.providers.includes(name)) {
      result.providers.push(name)
    }
  }

  // ── PATTERNS ──
  if (/jwt\.sign|jwt\.verify/i.test(allContent)) result.patterns.push('JWT tokens')
  if (/req\.session/i.test(allContent)) result.patterns.push('Server-side sessions')
  if (/HttpOnly|SameSite|cookie/i.test(allContent)) result.patterns.push('Cookie-based auth')
  if (/refreshToken|refresh_token/i.test(allContent)) result.patterns.push('Refresh tokens')
  if (/role|permission|authorize/i.test(allContent)) result.patterns.push('Role-based access control')
  if (/middleware.*auth|auth.*middleware|isAuthenticated|requireAuth/i.test(allContent)) {
    result.patterns.push('Auth middleware')
  }

  // ── AUTH FILES ──
  const authFilePatterns = /auth|login|session|passport|jwt|token/i
  result.files = allPaths.filter(p => authFilePatterns.test(p)).slice(0, 10)

  // ── MIDDLEWARE ──
  for (const file of files) {
    if (!file.content) continue
    if (/middleware/i.test(file.path) && /auth|token|session/i.test(file.content)) {
      result.middleware.push(file.path)
    }
  }

  return result
}

module.exports = { analyzeAuth }
