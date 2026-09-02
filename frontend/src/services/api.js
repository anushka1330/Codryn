'use strict'

/**
 * Codryn API client.
 * All API calls go through this module.
 * Never exposes API keys to the browser.
 */

const BASE_URL = '/api'

class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.status = status
    this.name = 'ApiError'
  }
}

async function request(path, options = {}) {
  const token = localStorage.getItem('codryn_token')
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers })
  const data = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))

  if (!res.ok) {
    throw new ApiError(data.error || `Request failed (${res.status})`, res.status)
  }

  return data
}

export const api = {
  get:    (path)         => request(path, { method: 'GET' }),
  post:   (path, body)   => request(path, { method: 'POST',   body: JSON.stringify(body) }),
  put:    (path, body)   => request(path, { method: 'PUT',    body: JSON.stringify(body) }),
  patch:  (path, body)   => request(path, { method: 'PATCH',  body: JSON.stringify(body) }),
  delete: (path)         => request(path, { method: 'DELETE' }),
}

export { ApiError }
export default api
