'use strict'

const { query, queryOne, execute } = require('../config/database')

const Repository = {

  async findById(id) {
    return queryOne('SELECT * FROM repositories WHERE id = ?', [id])
  },

  async findByFullName(fullName) {
    return queryOne('SELECT * FROM repositories WHERE full_name = ?', [fullName])
  },

  async findAll(userId = null) {
    if (userId) {
      return query(
        'SELECT * FROM repositories WHERE user_id = ? ORDER BY updated_at DESC',
        [userId]
      )
    }
    return query('SELECT * FROM repositories ORDER BY updated_at DESC')
  },

  async create({ user_id, owner, name, full_name, url, description, default_branch, language, stars, forks, status }) {
    const result = await execute(
      `INSERT INTO repositories
        (user_id, owner, name, full_name, url, description, default_branch, language, stars, forks, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [user_id || null, owner, name, full_name, url, description || null,
       default_branch || 'main', language || null, stars || 0, forks || 0, status || 'pending']
    )
    return this.findById(result.insertId)
  },

  async updateStatus(id, status, error_message = null) {
    await execute(
      'UPDATE repositories SET status = ?, error_message = ? WHERE id = ?',
      [status, error_message, id]
    )
  },

  async update(id, fields) {
    const allowed = ['status', 'description', 'language', 'stars', 'forks', 'default_branch', 'error_message']
    const sets = []
    const vals = []
    for (const [k, v] of Object.entries(fields)) {
      if (allowed.includes(k)) {
        sets.push(`${k} = ?`)
        vals.push(v)
      }
    }
    if (!sets.length) return
    vals.push(id)
    await execute(`UPDATE repositories SET ${sets.join(', ')} WHERE id = ?`, vals)
  },

  async delete(id) {
    await execute('DELETE FROM repositories WHERE id = ?', [id])
  },

  async count() {
    const row = await queryOne('SELECT COUNT(*) as total FROM repositories')
    return row?.total || 0
  },
}

module.exports = Repository
