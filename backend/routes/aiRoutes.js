'use strict'

const express = require('express')
const router  = express.Router()
const { traceFeature, changeImpact, explainCode } = require('../controllers/aiController')

// POST /api/repositories/:id/ai/trace
router.post('/:id/ai/trace', traceFeature)

// POST /api/repositories/:id/ai/impact
router.post('/:id/ai/impact', changeImpact)

// POST /api/repositories/:id/ai/explain
router.post('/:id/ai/explain', explainCode)

module.exports = router
