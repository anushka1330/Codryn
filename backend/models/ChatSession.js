'use strict'

const { query, queryOne, execute } = require('../config/database')

const ChatSession = {

  async findById(id) {
    return queryOne('SELECT * FROM chat_sessions WHERE id = ?', [id])
  },

  async findByRepository(repositoryId) {
    return query(
      'SELECT * FROM chat_sessions WHERE repository_id = ? ORDER BY updated_at DESC',
      [repositoryId]
    )
  },

  async create({ repository_id, user_id, title }) {
    const result = await execute(
      'INSERT INTO chat_sessions (repository_id, user_id, title) VALUES (?, ?, ?)',
      [repository_id, user_id || null, title || 'New Conversation']
    )
    return this.findById(result.insertId)
  },

  async updateTitle(id, title) {
    await execute('UPDATE chat_sessions SET title = ? WHERE id = ?', [title, id])
  },

  async touch(id) {
    await execute(
      'UPDATE chat_sessions SET updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [id]
    )
  },

  async delete(id) {
    await execute('DELETE FROM chat_sessions WHERE id = ?', [id])
  },
}

module.exports = ChatSession
