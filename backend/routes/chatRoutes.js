'use strict'

const express = require('express')
const router  = express.Router()
const { chat, getSessions, getMessages, deleteSession } = require('../controllers/chatController')

// POST /api/repositories/:id/chat
router.post('/:id/chat', chat)

// GET /api/repositories/:id/sessions
router.get('/:id/sessions', getSessions)

// GET /api/repositories/:id/sessions/:sessionId/messages
router.get('/:id/sessions/:sessionId/messages', getMessages)

// DELETE /api/repositories/:id/sessions/:sessionId
router.delete('/:id/sessions/:sessionId', deleteSession)

module.exports = router
