'use strict'

const express = require('express')
const router = express.Router()
const {
  importRepository,
  listRepositories,
  getRepository,
  listFiles,
  getFile,
} = require('../controllers/repositoryController')

// POST /api/repositories/import
router.post('/import', importRepository)

// GET /api/repositories
router.get('/', listRepositories)

// GET /api/repositories/:id
router.get('/:id', getRepository)

// GET /api/repositories/:id/files
router.get('/:id/files', listFiles)

// GET /api/repositories/:id/files/:fileId
router.get('/:id/files/:fileId', getFile)

module.exports = router
