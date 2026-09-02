'use strict'

const { processChat } = require('../services/chat/chatService')
const ChatSession     = require('../models/ChatSession')
const ChatMessage     = require('../models/ChatMessage')

/**
 * POST /api/repositories/:id/chat
 */
async function chat(req, res, next) {
  try {
    const { id: repositoryId } = req.params
    const { question, sessionId } = req.body
    const userId = req.user?.id || null

    if (!question || typeof question !== 'string' || !question.trim()) {
      return res.status(400).json({ error: 'Question is required.' })
    }

    const result = await processChat({
      repositoryId: parseInt(repositoryId),
      sessionId:    sessionId || null,
      question:     question.trim(),
      userId,
    })

    res.json({
      session: result.session,
      answer:  result.answer,
      history: result.history,
    })
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message })
    next(err)
  }
}

/**
 * GET /api/repositories/:id/sessions
 */
async function getSessions(req, res, next) {
  try {
    const sessions = await ChatSession.findByRepository(req.params.id)
    res.json({ sessions })
  } catch (err) {
    next(err)
  }
}

/**
 * GET /api/repositories/:id/sessions/:sessionId/messages
 */
async function getMessages(req, res, next) {
  try {
    const messages = await ChatMessage.findBySession(req.params.sessionId)
    res.json({ messages })
  } catch (err) {
    next(err)
  }
}

/**
 * DELETE /api/repositories/:id/sessions/:sessionId
 */
async function deleteSession(req, res, next) {
  try {
    await ChatSession.delete(req.params.sessionId)
    res.json({ message: 'Session deleted.' })
  } catch (err) {
    next(err)
  }
}

module.exports = { chat, getSessions, getMessages, deleteSession }
