'use strict'

const { generateText, isAvailable } = require('../services/ai/aiClient')
const { buildRepositoryContext }    = require('../services/ai/repositoryContext')
const { buildTracePrompt, buildExplainPrompt, buildImpactPrompt } = require('../services/ai/promptBuilder')
const Repository     = require('../models/Repository')
const RepositoryFile = require('../models/RepositoryFile')
const Analysis       = require('../models/Analysis')

async function runTask(req, res, next, taskType) {
  try {
    if (!isAvailable()) {
      return res.status(503).json({ error: 'AI service not configured.' })
    }

    const { id } = req.params
    const { target } = req.body

    if (!target) {
      return res.status(400).json({ error: 'Target is required.' })
    }

    // Load context
    const repository = await Repository.findById(id)
    if (!repository) return res.status(404).json({ error: 'Repository not found.' })

    const analysis = await Analysis.findByRepository(id)
    const files    = await RepositoryFile.findAllByRepository(id, { withContent: true })

    const context = buildRepositoryContext(repository, analysis, files, target)
    
    let prompt
    if (taskType === 'trace') prompt = buildTracePrompt(context, target)
    else if (taskType === 'impact') prompt = buildImpactPrompt(context, target)
    else if (taskType === 'explain') prompt = buildExplainPrompt(context, target)
    else return res.status(400).json({ error: 'Unknown task type' })

    const result = await generateText(prompt, { maxTokens: 2000 })
    
    res.json({ result })
  } catch (err) {
    next(err)
  }
}

async function traceFeature(req, res, next) {
  return runTask(req, res, next, 'trace')
}

async function changeImpact(req, res, next) {
  return runTask(req, res, next, 'impact')
}

async function explainCode(req, res, next) {
  return runTask(req, res, next, 'explain')
}

module.exports = { traceFeature, changeImpact, explainCode }
