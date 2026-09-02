'use strict'

const { analyzeRepository } = require('../services/analysis/analyzer')
const Repository     = require('../models/Repository')
const RepositoryFile = require('../models/RepositoryFile')
const Analysis       = require('../models/Analysis')

/**
 * POST /api/repositories/:id/analyze
 */
async function triggerAnalysis(req, res, next) {
  try {
    const { id } = req.params

    const repository = await Repository.findById(id)
    if (!repository) {
      return res.status(404).json({ error: 'Repository not found.' })
    }

    // Fetch files with content
    const files = await RepositoryFile.findAllByRepository(id, { withContent: true })
    if (!files || files.length === 0) {
      return res.status(422).json({ error: 'Repository has no files. Import the repository first.' })
    }

    // Update status
    await Repository.updateStatus(id, 'analyzing')

    // Run analysis
    const analysisData = await analyzeRepository(files)

    // Save to database
    const analysis = await Analysis.upsert(id, analysisData)

    // Update repository status
    await Repository.updateStatus(id, 'analyzed')

    res.json({
      message: 'Analysis complete.',
      analysis,
    })
  } catch (err) {
    // Reset status on failure
    try { await Repository.updateStatus(req.params.id, 'error', err.message) } catch {}
    next(err)
  }
}

/**
 * GET /api/repositories/:id/analysis
 */
async function getAnalysis(req, res, next) {
  try {
    const { id } = req.params
    const analysis = await Analysis.findByRepository(id)
    if (!analysis) {
      return res.status(404).json({ error: 'No analysis found. Run analysis first.' })
    }
    res.json({ analysis })
  } catch (err) {
    next(err)
  }
}

module.exports = { triggerAnalysis, getAnalysis }
