'use strict'

const { generateText, isAvailable } = require('../ai/aiClient')
const { buildRepositoryContext } = require('../ai/repositoryContext')
const { buildImpactPrompt } = require('../ai/promptBuilder')

/**
 * Analyze the change impact of modifying a file or symbol across the repository.
 * Performs real static reference tracking across source files.
 * 
 * @param {object} params
 * @param {object} params.repository - repository record
 * @param {object} params.analysis - repository analysis
 * @param {Array} params.files - repository_files records (with content)
 * @param {string} params.target - file path, file name, or symbol
 * @returns {Promise<string>} - formatted impact analysis markdown
 */
async function analyzeChangeImpact({ repository, analysis, files = [], target }) {
  if (!target || !target.trim()) {
    throw Object.assign(new Error('Target file or symbol is required.'), { status: 400 })
  }

  const rawTarget = target.trim()
  const targetBase = rawTarget.split('/').pop().replace(/\.[^/.]+$/, '') // e.g. "authRoutes" from "routes/authRoutes.js"
  const targetClean = rawTarget.replace(/^\.\//, '')

  // 1. Static Dependency & Reference Detection
  const directDependents = []
  const symbolReferences = []

  const importRegex = new RegExp(`['"\`]([^'"\`]*${escapeRegex(targetBase)}[^'"\`]*)['"\`]`, 'i')
  const symbolRegex = new RegExp(`\\b${escapeRegex(targetBase)}\\b`, 'i')

  for (const file of files) {
    if (!file.content) continue
    // Skip self
    if (file.path === targetClean || file.path.endsWith('/' + targetClean)) continue

    const hasImport = importRegex.test(file.content)
    const hasSymbol = symbolRegex.test(file.content)

    if (hasImport) {
      directDependents.push(file.path)
    } else if (hasSymbol) {
      symbolReferences.push(file.path)
    }
  }

  // Deduplicate
  const uniqueDirect = [...new Set(directDependents)]
  const uniqueRefs = [...new Set(symbolReferences)].filter(p => !uniqueDirect.includes(p))

  // 2. Identify Affected Routes
  const allRoutes = analysis?.apis?.routes || []
  const affectedRoutes = allRoutes.filter(r =>
    r.file === targetClean ||
    uniqueDirect.includes(r.file) ||
    uniqueRefs.includes(r.file)
  )

  // 3. Determine Risk Level
  const totalImpacted = uniqueDirect.length + uniqueRefs.length
  let riskLevel = 'Low'
  if (totalImpacted > 5) riskLevel = 'High'
  else if (totalImpacted > 1) riskLevel = 'Medium'

  // 4. Try AI synthesis for comprehensive explanation if available
  if (isAvailable()) {
    try {
      const context = buildRepositoryContext(repository, analysis, files, rawTarget)
      const prompt = buildImpactPrompt(context, rawTarget)
      const aiResponse = await generateText(prompt, { model: 'gemini-3.8-flash', maxTokens: 2048 })
      if (aiResponse && aiResponse.trim().length > 50) {
        return aiResponse.trim()
      }
    } catch (err) {
      console.warn('[impactAnalyzer] AI impact analysis unavailable, using static analysis:', err.message)
    }
  }

  // 5. Deterministic Impact Report
  let output = `### Change Impact Analysis: \`${rawTarget}\`\n\n`
  output += `**Estimated Risk Level:** **${riskLevel.toUpperCase()}** (${totalImpacted} affected files detected)\n\n`

  if (uniqueDirect.length > 0) {
    output += `#### 1. Direct Dependent Files (${uniqueDirect.length})\n`
    output += `These files directly import or require \`${rawTarget}\`:\n`
    uniqueDirect.slice(0, 10).forEach(f => {
      output += `- \`${f}\`\n`
    })
    if (uniqueDirect.length > 10) output += `- *...and ${uniqueDirect.length - 10} more files*\n`
    output += '\n'
  } else {
    output += `#### 1. Direct Dependents\nNo direct module imports or require statements found targeting this file.\n\n`
  }

  if (uniqueRefs.length > 0) {
    output += `#### 2. Code & Symbol References (${uniqueRefs.length})\n`
    output += `These files reference symbols or identifiers matching \`${targetBase}\`:\n`
    uniqueRefs.slice(0, 8).forEach(f => {
      output += `- \`${f}\`\n`
    })
    if (uniqueRefs.length > 8) output += `- *...and ${uniqueRefs.length - 8} more files*\n`
    output += '\n'
  }

  if (affectedRoutes.length > 0) {
    output += `#### 3. Potentially Affected API Routes (${affectedRoutes.length})\n`
    affectedRoutes.slice(0, 6).forEach(r => {
      output += `- **${r.method}** \`${r.path}\` (in \`${r.file}\`)\n`
    })
    output += '\n'
  }

  output += `---\n`
  output += `*Grounded in static repository reference and import analysis across ${files.length} source files.*`

  return output
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

module.exports = { analyzeChangeImpact }
