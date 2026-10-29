'use strict'

const { generateText, isAvailable } = require('../ai/aiClient')
const { buildRepositoryContext }   = require('../ai/repositoryContext')
const { buildChatPrompt }          = require('../ai/promptBuilder')
const Repository     = require('../../models/Repository')
const RepositoryFile = require('../../models/RepositoryFile')
const Analysis       = require('../../models/Analysis')
const ChatSession    = require('../../models/ChatSession')
const ChatMessage    = require('../../models/ChatMessage')

/**
 * Process a chat message for a repository.
 */
async function processChat({ repositoryId, sessionId, question, userId }) {
  if (!isAvailable()) {
    throw Object.assign(
      new Error('AI service not configured. Set GEMINI_API_KEY in your .env file.'),
      { status: 503 }
    )
  }

  // Get or create session
  let session
  if (sessionId) {
    session = await ChatSession.findById(sessionId)
    if (!session || session.repository_id != repositoryId) {
      throw Object.assign(new Error('Chat session not found.'), { status: 404 })
    }
  } else {
    // Create new session with auto-title from first message
    const title = question.length > 50 ? question.slice(0, 50) + '…' : question
    session = await ChatSession.create({ repository_id: repositoryId, user_id: userId, title })
  }

  // Load history
  const history = await ChatMessage.findBySession(session.id)

  // Get repository and analysis
  const repository = await Repository.findById(repositoryId)
  const analysis   = await Analysis.findByRepository(repositoryId)
  const files      = await RepositoryFile.findAllByRepository(repositoryId, { withContent: true })

  // Build context
  const context = buildRepositoryContext(repository, analysis, files, question)
  const prompt  = buildChatPrompt(context, question, history)

  // Call AI
  let answer
  try {
    answer = await generateText(prompt, { maxTokens: 1500 })
  } catch (err) {
    const error = new Error(err.message || 'AI generation failed. Please try again.')
    error.status = err.status || 502
    throw error
  }

  // Save messages
  await ChatMessage.create({ session_id: session.id, role: 'user', content: question })
  await ChatMessage.create({ session_id: session.id, role: 'assistant', content: answer })

  // Touch session timestamp
  await ChatSession.touch(session.id)

  return { session, answer, history: await ChatMessage.findBySession(session.id) }
}

module.exports = { processChat }
