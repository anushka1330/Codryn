'use strict'

const { query, queryOne, execute } = require('../config/database')

const User = {

  /**
   * Find a user by ID.
   */
  async findById(id) {
    return queryOne(
      'SELECT id, name, email, created_at, updated_at FROM users WHERE id = ?',
      [id]
    )
  },

  /**
   * Find a user by email.
   */
  async findByEmail(email) {
    return queryOne(
      'SELECT * FROM users WHERE email = ?',
      [email]
    )
  },

  /**
   * Create a new user.
   * @param {object} data - { name, email, password_hash }
   */
  async create({ name, email, password_hash }) {
    const result = await execute(
      'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
      [name, email, password_hash]
    )
    return this.findById(result.insertId)
  },

  /**
   * Check if an email already exists.
   */
  async emailExists(email) {
    const row = await queryOne('SELECT id FROM users WHERE email = ?', [email])
    return !!row
  },
}

module.exports = User
