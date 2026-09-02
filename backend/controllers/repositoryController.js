'use strict'

const repositoryService = require('../services/repositoryService')
const RepositoryFile    = require('../models/RepositoryFile')

/**
 * POST /api/repositories/import
 * Import a GitHub repository.
 */
async function importRepository(req, res, next) {
  try {
    const { url } = req.body
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'GitHub repository URL is required.' })
    }

    const userId = req.user?.id || null
    const result = await repositoryService.importRepository(url.trim(), userId)

    res.status(201).json({
      message:    'Repository imported successfully.',
      repository: result.repository,
    })
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ error: err.message })
    }
    next(err)
  }
}

/**
 * GET /api/repositories
 * List all repositories.
 */
async function listRepositories(req, res, next) {
  try {
    const userId = req.user?.id || null
    const repositories = await repositoryService.getRepositories(userId)
    res.json({ repositories })
  } catch (err) {
    next(err)
  }
}

/**
 * GET /api/repositories/:id
 * Get a single repository.
 */
async function getRepository(req, res, next) {
  try {
    const { id } = req.params
    const repository = await repositoryService.getRepositoryById(id)
    if (!repository) {
      return res.status(404).json({ error: 'Repository not found.' })
    }
    res.json({ repository })
  } catch (err) {
    next(err)
  }
}

/**
 * GET /api/repositories/:id/files
 * List files for a repository (without content).
 */
async function listFiles(req, res, next) {
  try {
    const { id } = req.params
    const files = await RepositoryFile.findAllByRepository(id, { withContent: false })
    res.json({ files })
  } catch (err) {
    next(err)
  }
}

/**
 * GET /api/repositories/:id/files/:fileId
 * Get a single file with content.
 */
async function getFile(req, res, next) {
  try {
    const { fileId } = req.params
    const file = await RepositoryFile.findById(fileId)
    if (!file) {
      return res.status(404).json({ error: 'File not found.' })
    }
    res.json({ file })
  } catch (err) {
    next(err)
  }
}

module.exports = {
  importRepository,
  listRepositories,
  getRepository,
  listFiles,
  getFile,
}
