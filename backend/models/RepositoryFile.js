'use strict'

const { query, queryOne, execute } = require('../config/database')

const RepositoryFile = {

  async findById(id) {
    return queryOne('SELECT * FROM repository_files WHERE id = ?', [id])
  },

  async findByPath(repositoryId, path) {
    return queryOne(
      'SELECT * FROM repository_files WHERE repository_id = ? AND path = ?',
      [repositoryId, path]
    )
  },

  async findAllByRepository(repositoryId, { withContent = false } = {}) {
    const cols = withContent
      ? '*'
      : 'id, repository_id, path, name, extension, language, size, created_at'
    return query(
      `SELECT ${cols} FROM repository_files WHERE repository_id = ? ORDER BY path ASC`,
      [repositoryId]
    )
  },

  async findByExtension(repositoryId, extension) {
    return query(
      'SELECT * FROM repository_files WHERE repository_id = ? AND extension = ?',
      [repositoryId, extension]
    )
  },

  async create({ repository_id, path, name, extension, language, size, content }) {
    const result = await execute(
      `INSERT INTO repository_files
         (repository_id, path, name, extension, language, size, content)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [repository_id, path, name, extension || null, language || null, size || 0, content || null]
    )
    return result.insertId
  },

  async bulkCreate(files) {
    if (!files.length) return
    // Insert in chunks of 50 to avoid huge queries
    const CHUNK = 50
    for (let i = 0; i < files.length; i += CHUNK) {
      const chunk = files.slice(i, i + CHUNK)
      const placeholders = chunk.map(() => '(?, ?, ?, ?, ?, ?, ?)').join(', ')
      const values = chunk.flatMap(f => [
        f.repository_id, f.path, f.name,
        f.extension || null, f.language || null,
        f.size || 0, f.content || null,
      ])
      await execute(
        `INSERT INTO repository_files
           (repository_id, path, name, extension, language, size, content)
         VALUES ${placeholders}`,
        values
      )
    }
  },

  async deleteByRepository(repositoryId) {
    await execute('DELETE FROM repository_files WHERE repository_id = ?', [repositoryId])
  },

  async countByRepository(repositoryId) {
    const row = await queryOne(
      'SELECT COUNT(*) as total FROM repository_files WHERE repository_id = ?',
      [repositoryId]
    )
    return row?.total || 0
  },
}

module.exports = RepositoryFile
