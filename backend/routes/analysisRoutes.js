'use strict'

const express = require('express')
const router  = express.Router()
const { triggerAnalysis, getAnalysis } = require('../controllers/analysisController')

// POST /api/repositories/:id/analyze
router.post('/:id/analyze', triggerAnalysis)

// GET /api/repositories/:id/analysis
router.get('/:id/analysis', getAnalysis)

module.exports = router
