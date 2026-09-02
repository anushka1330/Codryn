'use strict'

const { queryOne, execute } = require('../config/database')

const Analysis = {

  async findByRepository(repositoryId) {
    return queryOne('SELECT * FROM analyses WHERE repository_id = ?', [repositoryId])
  },

  /**
   * Upsert analysis for a repository.
   * @param {number} repositoryId
   * @param {object} data - { tech_stack, architecture, dependencies, apis, database_info, authentication, deployment, setup, project_health }
   */
  async upsert(repositoryId, data) {
    const fields = [
      'tech_stack', 'architecture', 'dependencies', 'apis',
      'database_info', 'authentication', 'deployment', 'setup', 'project_health',
    ]

    // Check if exists
    const existing = await this.findByRepository(repositoryId)

    const values = fields.map(f =>
      data[f] !== undefined ? JSON.stringify(data[f]) : null
    )

    if (existing) {
      const setClauses = fields.map(f => `${f} = ?`).join(', ')
      await execute(
        `UPDATE analyses SET ${setClauses} WHERE repository_id = ?`,
        [...values, repositoryId]
      )
    } else {
      const cols = ['repository_id', ...fields].join(', ')
      const placeholders = ['?', ...fields.map(() => '?')].join(', ')
      await execute(
        `INSERT INTO analyses (${cols}) VALUES (${placeholders})`,
        [repositoryId, ...values]
      )
    }

    return this.findByRepository(repositoryId)
  },

  async delete(repositoryId) {
    await execute('DELETE FROM analyses WHERE repository_id = ?', [repositoryId])
  },
}

module.exports = Analysis
