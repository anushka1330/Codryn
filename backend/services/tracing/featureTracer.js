'use strict'

const { generateText, isAvailable } = require('../ai/aiClient')
const { buildRepositoryContext } = require('../ai/repositoryContext')
const { buildTracePrompt } = require('../ai/promptBuilder')

/**
 * Trace a feature through a codebase using both static code inspection and AI synthesis.
 * 
 * @param {object} params
 * @param {object} params.repository - repository record
 * @param {object} params.analysis - repository analysis
 * @param {Array} params.files - repository_files records (with content)
 * @param {string} params.target - feature description / query
 * @returns {Promise<string>} - formatted trace markdown
 */
async function traceFeature({ repository, analysis, files = [], target }) {
  if (!target || !target.trim()) {
    throw Object.assign(new Error('Feature description is required.'), { status: 400 })
  }

  const query = target.trim().toLowerCase()
  const terms = query.split(/\s+/).filter(t => t.length > 2)

  // 1. Identify relevant files across architectural layers
  const scoredFiles = files.map(file => {
    let score = 0
    const pathLower = file.path.toLowerCase()
    const contentLower = (file.content || '').toLowerCase()

    for (const term of terms) {
      if (pathLower.includes(term)) score += 5
      const matches = (contentLower.match(new RegExp(term, 'g')) || []).length
      score += Math.min(matches, 5)
    }

    // Boost entry points and controllers
    if (/controller|route|handler|api/i.test(file.path)) score += 2
    if (/service|logic|manager|helper/i.test(file.path)) score += 2
    if (/model|schema|dao|repository/i.test(file.path)) score += 2
    if (/main|index|app|page|view/i.test(file.path)) score += 1

    return { file, score }
  }).filter(item => item.score > 0).sort((a, b) => b.score - a.score)

  const topFiles = scoredFiles.slice(0, 10).map(s => s.file)

  // 2. Attempt AI Generation first if available
  if (isAvailable()) {
    try {
      const context = buildRepositoryContext(repository, analysis, files, target)
      const prompt = buildTracePrompt(context, target)
      const aiResponse = await generateText(prompt, { model: 'gemini-3.8-flash', maxTokens: 2048 })
      if (aiResponse && aiResponse.trim().length > 50) {
        return aiResponse.trim()
      }
    } catch (err) {
      console.warn('[featureTracer] AI trace unavailable, falling back to deterministic trace:', err.message)
    }
  }

  // 3. Fallback deterministic trace based on actual repository structure
  const steps = []

  // Layer 1: Entry / Client
  const uiOrEntry = topFiles.find(f => /view|page|component|client|main|index/i.test(f.path)) || files.find(f => /index\.|main\./i.test(f.name))
  if (uiOrEntry) {
    steps.push({
      layer: 'UI / Entry Point',
      file: uiOrEntry.path,
      action: `Initiates action related to "${target}" via user interface or entry point handler.`,
    })
  }

  // Layer 2: Routing / Dispatch
  const routeOrHandler = topFiles.find(f => /route|controller|handler|api/i.test(f.path) && f.path !== uiOrEntry?.path)
  if (routeOrHandler) {
    steps.push({
      layer: 'Routing / Controller',
      file: routeOrHandler.path,
      action: `Dispatches request and validates parameters for "${target}".`,
    })
  }

  // Layer 3: Service / Core Logic
  const serviceOrLogic = topFiles.find(f => /service|logic|util|manager|helper/i.test(f.path) && !steps.some(s => s.file === f.path))
  if (serviceOrLogic) {
    steps.push({
      layer: 'Business Logic & Services',
      file: serviceOrLogic.path,
      action: `Executes core domain operations and data transformation for "${target}".`,
    })
  }

  // Layer 4: Storage / Persistence
  const modelOrDb = topFiles.find(f => /model|schema|db|database|entity|table|sql/i.test(f.path) && !steps.some(s => s.file === f.path))
  if (modelOrDb) {
    steps.push({
      layer: 'Data & Persistence Layer',
      file: modelOrDb.path,
      action: `Interacts with storage/database to read or persist state changes.`,
    })
  }

  // If few specific layers matched, list the top scored files
  if (steps.length === 0 && topFiles.length > 0) {
    topFiles.slice(0, 4).forEach((f, idx) => {
      steps.push({
        layer: `Step ${idx + 1}`,
        file: f.path,
        action: `Matched file containing references to "${target}".`,
      })
    })
  }

  if (steps.length === 0) {
    return `### Flow Analysis for "${target}"\n\nNo direct file references matching "${target}" were found in this repository. Try searching for specific filenames, route paths, or exported function names.`
  }

  let output = `### Code Flow Trace for "${target}"\n\n`
  output += `Analysis of ${files.length} repository source files identified the following execution path:\n\n`

  steps.forEach((st, idx) => {
    output += `**${idx + 1}. [${st.layer}] \`${st.file}\`**\n`
    output += `${st.action}\n\n`
  })

  output += `---\n*Trace grounded in static repository analysis and source file matching.*`
  return output
}

module.exports = { traceFeature }
