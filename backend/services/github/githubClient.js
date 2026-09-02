'use strict'

const fetch = require('node-fetch')

const GITHUB_API_BASE = 'https://api.github.com'

/**
 * Make an authenticated request to the GitHub REST API.
 */
async function githubRequest(path, options = {}) {
  const token = process.env.GITHUB_TOKEN
  const headers = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'Codryn/1.0',
    ...(token ? { 'Authorization': `token ${token}` } : {}),
    ...options.headers,
  }

  const url = path.startsWith('http') ? path : `${GITHUB_API_BASE}${path}`
  const res = await fetch(url, { ...options, headers })

  // Handle rate limiting
  if (res.status === 403 || res.status === 429) {
    const resetAt = res.headers.get('x-ratelimit-reset')
    const resetDate = resetAt ? new Date(parseInt(resetAt) * 1000).toISOString() : 'unknown'
    const err = new Error(`GitHub API rate limit exceeded. Resets at ${resetDate}.`)
    err.status = 429
    throw err
  }

  if (res.status === 404) {
    const err = new Error('Repository not found on GitHub.')
    err.status = 404
    throw err
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    const err = new Error(body.message || `GitHub API error: ${res.status}`)
    err.status = res.status
    throw err
  }

  return res.json()
}

/**
 * Fetch raw file content (returns text, not JSON).
 */
async function githubRawRequest(url) {
  const token = process.env.GITHUB_TOKEN
  const headers = {
    'User-Agent': 'Codryn/1.0',
    ...(token ? { 'Authorization': `token ${token}` } : {}),
  }
  const res = await fetch(url, { headers })
  if (!res.ok) return null
  return res.text()
}

/**
 * Get repository metadata.
 */
async function getRepository(owner, repo) {
  return githubRequest(`/repos/${owner}/${repo}`)
}

/**
 * Get the git tree for a repository (flat, recursive).
 */
async function getTree(owner, repo, sha = 'HEAD') {
  return githubRequest(`/repos/${owner}/${repo}/git/trees/${sha}?recursive=1`)
}

/**
 * Get file content (base64 encoded by GitHub API).
 */
async function getFileContent(owner, repo, path) {
  try {
    const data = await githubRequest(`/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}`)
    if (data.encoding === 'base64') {
      return Buffer.from(data.content.replace(/\n/g, ''), 'base64').toString('utf8')
    }
    // Large file — try download_url
    if (data.download_url) {
      return githubRawRequest(data.download_url)
    }
    return null
  } catch {
    return null
  }
}

/**
 * Get the default branch of a repository.
 */
async function getDefaultBranch(owner, repo) {
  const data = await getRepository(owner, repo)
  return data.default_branch || 'main'
}

module.exports = {
  githubRequest,
  getRepository,
  getTree,
  getFileContent,
  getDefaultBranch,
}
