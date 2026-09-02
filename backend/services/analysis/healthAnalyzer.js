'use strict'

/**
 * Calculate project health score.
 * Score: 0-100.
 * 
 * Note: This is an estimate based on static analysis.
 * Not an absolute measure of code quality.
 */
function analyzeProjectHealth(files, techStack) {
  const findings = []
  let score = 100
  const paths = files.map(f => f.path)
  const allContent = files.map(f => f.content || '').join('\n')

  // ── TESTING (25 points) ──
  const testFiles = files.filter(f => /\.(test|spec)\.[jt]sx?$/.test(f.path) || /__tests__/.test(f.path))
  const hasTests = testFiles.length > 0
  const testRatio = testFiles.length / Math.max(files.filter(f => /\.[jt]sx?$/.test(f.path)).length, 1)

  if (!hasTests) {
    score -= 20
    findings.push({ category: 'Testing', severity: 'warning', message: 'No test files detected.' })
  } else if (testRatio < 0.1) {
    score -= 10
    findings.push({ category: 'Testing', severity: 'info', message: `Low test coverage ratio (${Math.round(testRatio * 100)}% of source files have tests).` })
  }

  // ── DOCUMENTATION (15 points) ──
  const hasReadme = paths.some(p => /readme\.md$/i.test(p))
  if (!hasReadme) {
    score -= 10
    findings.push({ category: 'Documentation', severity: 'warning', message: 'No README.md found.' })
  }

  const hasEnvExample = paths.some(p => /\.env\.example$/.test(p))
  if (!hasEnvExample) {
    score -= 5
    findings.push({ category: 'Documentation', severity: 'info', message: 'No .env.example file — environment variables may not be documented.' })
  }

  // ── COMPLEXITY (20 points) ──
  const largeFiles = files.filter(f => f.size > 50 * 1024) // > 50 KB
  if (largeFiles.length > 5) {
    score -= 15
    findings.push({
      category: 'Complexity',
      severity: 'warning',
      message: `${largeFiles.length} very large files detected.`,
      files: largeFiles.map(f => f.path).slice(0, 5),
    })
  } else if (largeFiles.length > 0) {
    score -= 5
    findings.push({
      category: 'Complexity',
      severity: 'info',
      message: `${largeFiles.length} large file(s) detected.`,
      files: largeFiles.map(f => f.path),
    })
  }

  // ── SECURITY (20 points) ──
  const hardcodedSecrets = checkHardcodedSecrets(files)
  if (hardcodedSecrets.length > 0) {
    score -= 20
    findings.push({
      category: 'Security',
      severity: 'danger',
      message: 'Possible hardcoded secrets or credentials detected.',
      files: hardcodedSecrets.slice(0, 3),
    })
  }

  // ── DEPENDENCIES (10 points) ──
  const hasDependabot = paths.some(p => /dependabot/i.test(p))
  if (!hasDependabot) {
    findings.push({ category: 'Dependencies', severity: 'info', message: 'No Dependabot configuration found.' })
  }

  // ── ARCHITECTURE (10 points) ──
  const maxDepth = Math.max(...paths.map(p => p.split('/').length))
  if (maxDepth > 10) {
    score -= 5
    findings.push({ category: 'Architecture', severity: 'info', message: `Deep directory nesting detected (max depth: ${maxDepth}).` })
  }

  score = Math.max(0, Math.min(100, score))

  // ── CATEGORY SCORES ──
  const categories = [
    { name: 'Testing',       score: hasTests ? (testRatio >= 0.1 ? 'Good' : 'Needs attention') : 'Needs attention' },
    { name: 'Documentation', score: hasReadme ? 'Good' : 'Needs attention' },
    { name: 'Security',      score: hardcodedSecrets.length === 0 ? 'Good' : 'Needs attention' },
    { name: 'Complexity',    score: largeFiles.length === 0 ? 'Good' : largeFiles.length <= 2 ? 'Good' : 'Needs attention' },
    { name: 'Dependencies',  score: 'Good' },
  ]

  return {
    score,
    categories,
    findings,
    note: 'This health score is an estimate based on static analysis of repository structure and content.',
  }
}

function checkHardcodedSecrets(files) {
  const suspiciousFiles = []
  // Patterns that suggest hardcoded secrets (not in .env.example)
  const patterns = [
    /(?:password|passwd|secret|api_key|apikey|token)\s*=\s*['"][^'"]{8,}['"]/i,
    /(?:AWS_SECRET|aws_access_key_id)\s*=\s*[A-Z0-9]{16,}/i,
  ]

  for (const file of files) {
    if (!file.content) continue
    if (/\.env\.example$|\.env\.sample$|\.md$/i.test(file.path)) continue
    if (/\.(test|spec)\.[jt]sx?$/.test(file.path)) continue

    for (const pattern of patterns) {
      if (pattern.test(file.content)) {
        suspiciousFiles.push(file.path)
        break
      }
    }
  }
  return suspiciousFiles
}

module.exports = { analyzeProjectHealth }
