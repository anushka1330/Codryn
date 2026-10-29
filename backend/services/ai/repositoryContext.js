'use strict'

/**
 * Build repository context for AI prompts.
 * 
 * Does NOT blindly send the entire repository.
 * Selects the most relevant context for each question type.
 */

/**
 * Build a concise repository context string for the AI.
 */
function buildRepositoryContext(repository, analysis, files, question = '') {
  const parts = []

  // ── REPOSITORY BASICS ──
  parts.push(`## Repository: ${repository.full_name}`)
  if (repository.description) parts.push(`Description: ${repository.description}`)
  parts.push(`Language: ${repository.language || 'Unknown'}`)
  parts.push(`Default branch: ${repository.default_branch || 'main'}`)
  parts.push('')

  // ── TECH STACK ──
  if (analysis?.tech_stack) {
    const ts = analysis.tech_stack
    const techItems = []
    if (ts.languages?.length) {
      techItems.push(`Languages: ${ts.languages.map(l => l.name ? `${l.name} (${l.fileCount} files)` : l).join(', ')}`)
    }
    if (ts.frameworks?.length) techItems.push(`Frameworks: ${ts.frameworks.join(', ')}`)
    if (ts.databases?.length)  techItems.push(`Databases: ${ts.databases.join(', ')}`)
    if (ts.orms?.length)       techItems.push(`ORMs: ${ts.orms.join(', ')}`)
    if (ts.testing?.length)    techItems.push(`Testing: ${ts.testing.join(', ')}`)
    if (techItems.length) {
      parts.push('## Tech Stack')
      parts.push(techItems.join('\n'))
      parts.push('')
    }
  }

  // ── ARCHITECTURE ──
  if (analysis?.architecture?.layers?.length) {
    parts.push('## Architecture Layers')
    for (const layer of analysis.architecture.layers) {
      parts.push(`- ${layer.name}: ${layer.description}`)
      if (layer.files?.length) {
        parts.push(`  Files: ${layer.files.slice(0, 3).join(', ')}`)
      }
    }
    parts.push('')
  }

  // ── RELEVANT FILES ──
  const relevantFiles = selectRelevantFiles(files, question)
  if (relevantFiles.length > 0) {
    parts.push('## Key Source Files')
    for (const file of relevantFiles) {
      parts.push(`\n### ${file.path}`)
      const content = file.content || ''
      // Truncate large files
      const truncated = content.length > 3000 ? content.slice(0, 3000) + '\n... (truncated)' : content
      parts.push('```')
      parts.push(truncated)
      parts.push('```')
    }
    parts.push('')
  }

  // ── AUTH ──
  if (analysis?.authentication && isAuthQuestion(question)) {
    const auth = analysis.authentication
    if (auth.providers?.length) {
      parts.push('## Authentication')
      parts.push(`Providers: ${auth.providers.join(', ')}`)
      if (auth.patterns?.length) parts.push(`Patterns: ${auth.patterns.join(', ')}`)
      if (auth.files?.length) parts.push(`Auth files: ${auth.files.join(', ')}`)
      parts.push('')
    }
  }

  // ── APIs ──
  if (analysis?.apis?.routes?.length && isApiQuestion(question)) {
    parts.push('## Detected API Routes')
    const routes = analysis.apis.routes.slice(0, 20)
    for (const route of routes) {
      parts.push(`${route.method} ${route.path} (${route.file})`)
    }
    parts.push('')
  }

  return parts.join('\n')
}

/**
 * Select files most relevant to the user's question.
 */
function selectRelevantFiles(files, question) {
  if (!files || !files.length) return []
  if (!question) return files.slice(0, 5)

  const q = question.toLowerCase()
  const scored = files.map(file => {
    let score = 0
    const path = file.path.toLowerCase()
    const content = (file.content || '').toLowerCase()

    // Keyword matching
    const keywords = extractKeywords(q)
    for (const kw of keywords) {
      if (path.includes(kw)) score += 3
      if (content.includes(kw)) score += 1
    }

    // Route/auth questions
    if (isAuthQuestion(q) && /auth|login|session|passport|jwt/i.test(path)) score += 5
    if (isApiQuestion(q) && /routes?|controllers?|api/i.test(path)) score += 5
    if (q.includes('database') && /models?|schemas?|prisma|sequelize/i.test(path)) score += 5

    return { file, score }
  })

  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map(s => s.file)
}

function extractKeywords(question) {
  return question
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 3 && !STOPWORDS.has(w))
}

const STOPWORDS = new Set(['this', 'that', 'with', 'from', 'what', 'where', 'when', 'does', 'work', 'how', 'does'])

function isAuthQuestion(q) {
  return /auth|login|logout|signin|signup|session|jwt|token|password|oauth/i.test(q)
}

function isApiQuestion(q) {
  return /api|route|endpoint|request|response|controller/i.test(q)
}

module.exports = { buildRepositoryContext }
