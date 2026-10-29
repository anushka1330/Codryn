'use strict'

const { traceFeature: runFeatureTrace } = require('../services/tracing/featureTracer')
const { analyzeChangeImpact: runImpactAnalysis } = require('../services/impact/impactAnalyzer')
const { generateText, isAvailable } = require('../services/ai/aiClient')
const { buildRepositoryContext } = require('../services/ai/repositoryContext')
const { buildExplainPrompt } = require('../services/ai/promptBuilder')
const Repository     = require('../models/Repository')
const RepositoryFile = require('../models/RepositoryFile')
const Analysis       = require('../models/Analysis')

/**
 * POST /api/repositories/:id/ai/trace
 */
async function traceFeature(req, res, next) {
  try {
    const { id } = req.params
    const { target } = req.body

    if (!target || typeof target !== 'string' || !target.trim()) {
      return res.status(400).json({ error: 'Target feature description is required.' })
    }

    const repository = await Repository.findById(id)
    if (!repository) return res.status(404).json({ error: 'Repository not found.' })

    const analysis = await Analysis.findByRepository(id)
    const files = await RepositoryFile.findAllByRepository(id, { withContent: true })

    const result = await runFeatureTrace({
      repository,
      analysis,
      files,
      target: target.trim(),
    })

    res.json({ result })
  } catch (err) {
    next(err)
  }
}

/**
 * POST /api/repositories/:id/ai/impact
 */
async function changeImpact(req, res, next) {
  try {
    const { id } = req.params
    const { target } = req.body

    if (!target || typeof target !== 'string' || !target.trim()) {
      return res.status(400).json({ error: 'Target file or symbol is required.' })
    }

    const repository = await Repository.findById(id)
    if (!repository) return res.status(404).json({ error: 'Repository not found.' })

    const analysis = await Analysis.findByRepository(id)
    const files = await RepositoryFile.findAllByRepository(id, { withContent: true })

    const result = await runImpactAnalysis({
      repository,
      analysis,
      files,
      target: target.trim(),
    })

    res.json({ result })
  } catch (err) {
    next(err)
  }
}

/**
 * POST /api/repositories/:id/ai/explain
 */
async function explainCode(req, res, next) {
  try {
    const { id } = req.params
    const { target } = req.body

    if (!target || typeof target !== 'string' || !target.trim()) {
      return res.status(400).json({ error: 'Target code or symbol is required.' })
    }

    const repository = await Repository.findById(id)
    if (!repository) return res.status(404).json({ error: 'Repository not found.' })

    const analysis = await Analysis.findByRepository(id)
    const files = await RepositoryFile.findAllByRepository(id, { withContent: true })

    if (isAvailable()) {
      try {
        const context = buildRepositoryContext(repository, analysis, files, target)
        const prompt = buildExplainPrompt(context, target)
        const result = await generateText(prompt, { model: 'gemini-3.8-flash', maxTokens: 2000 })
        return res.json({ result })
      } catch (err) {
        console.warn('[explainCode] AI generation failed, using fallback summary:', err.message)
      }
    }

    // Fallback explain
    const matched = files.find(f => f.path.includes(target) || f.name.includes(target))
    const result = matched
      ? `### Code Explanation: \`${target}\`\n\nFound matching file \`${matched.path}\` (${matched.language || 'Code'}).\n\n- **Size:** ${matched.size} bytes\n- **Role:** Source module in repository \`${repository.full_name}\`.\n\n*(Static explanation provided while AI service is busy).*`
      : `### Code Explanation: \`${target}\`\n\nNo file matching \`${target}\` was located in repository \`${repository.full_name}\`.`

    res.json({ result })
  } catch (err) {
    next(err)
  }
}

module.exports = { traceFeature, changeImpact, explainCode }
