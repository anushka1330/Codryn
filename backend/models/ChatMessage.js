'use strict'

const { query, execute } = require('../config/database')

const ChatMessage = {

  async findBySession(sessionId) {
    return query(
      'SELECT * FROM chat_messages WHERE session_id = ? ORDER BY created_at ASC',
      [sessionId]
    )
  },

  /**
   * @param {object} data - { session_id, role, content, metadata }
   */
  async create({ session_id, role, content, metadata }) {
    const result = await execute(
      'INSERT INTO chat_messages (session_id, role, content, metadata) VALUES (?, ?, ?, ?)',
      [session_id, role, content, metadata ? JSON.stringify(metadata) : null]
    )
    return { id: result.insertId, session_id, role, content, metadata }
  },

  async deleteBySession(sessionId) {
    await execute('DELETE FROM chat_messages WHERE session_id = ?', [sessionId])
  },

  async countBySession(sessionId) {
    const [row] = await query(
      'SELECT COUNT(*) as total FROM chat_messages WHERE session_id = ?',
      [sessionId]
    )
    return row?.total || 0
  },
}

module.exports = ChatMessage
