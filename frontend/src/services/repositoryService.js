import api from './api'

/**
 * Repository service — frontend interface to backend repository APIs.
 */
export const repositoryService = {

  /** Import a GitHub repository by URL */
  async import(url) {
    return api.post('/repositories/import', { url })
  },

  /** List all repositories */
  async list() {
    return api.get('/repositories')
  },

  /** Get a single repository by ID */
  async get(id) {
    return api.get(`/repositories/${id}`)
  },

  /** List files for a repository (no content) */
  async listFiles(repositoryId) {
    return api.get(`/repositories/${repositoryId}/files`)
  },

  /** Get a single file with content */
  async getFile(repositoryId, fileId) {
    return api.get(`/repositories/${repositoryId}/files/${fileId}`)
  },

  /** Trigger analysis */
  async analyze(repositoryId) {
    return api.post(`/repositories/${repositoryId}/analyze`, {})
  },

  /** Get analysis results */
  async getAnalysis(repositoryId) {
    return api.get(`/repositories/${repositoryId}/analysis`)
  },

  /** Trace a feature */
  async traceFeature(repositoryId, target) {
    return api.post(`/repositories/${repositoryId}/ai/trace`, { target })
  },

  /** Change Impact analysis */
  async changeImpact(repositoryId, target) {
    return api.post(`/repositories/${repositoryId}/ai/impact`, { target })
  },

  /** Explain Code */
  async explainCode(repositoryId, target) {
    return api.post(`/repositories/${repositoryId}/ai/explain`, { target })
  },
}

/**
 * Chat service — frontend interface to backend chat APIs.
 */
export const chatService = {

  /** Send a chat message */
  async chat(repositoryId, question, sessionId = null) {
    return api.post(`/repositories/${repositoryId}/chat`, { question, sessionId })
  },

  /** Get all chat sessions for a repository */
  async getSessions(repositoryId) {
    return api.get(`/repositories/${repositoryId}/sessions`)
  },

  /** Get messages for a session */
  async getMessages(repositoryId, sessionId) {
    return api.get(`/repositories/${repositoryId}/sessions/${sessionId}/messages`)
  },

  /** Delete a chat session */
  async deleteSession(repositoryId, sessionId) {
    return api.delete(`/repositories/${repositoryId}/sessions/${sessionId}`)
  },
}

export default repositoryService
