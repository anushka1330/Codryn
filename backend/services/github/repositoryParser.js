'use strict'

/**
 * Parse a GitHub URL into owner and repository name.
 * 
 * Supports:
 *   https://github.com/owner/repo
 *   https://github.com/owner/repo.git
 *   http://github.com/owner/repo
 *   github.com/owner/repo
 *   owner/repo
 */
function parseGitHubUrl(url) {
  if (!url || typeof url !== 'string') {
    throw new Error('Invalid URL: must be a non-empty string.')
  }

  const cleaned = url.trim()

  // Match github.com/owner/repo patterns
  const patterns = [
    // Full URL with optional protocol and .git
    /^(?:https?:\/\/)?github\.com\/([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+?)(?:\.git)?(?:\/.*)?$/,
    // Short owner/repo format
    /^([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)$/,
  ]

  for (const pattern of patterns) {
    const match = cleaned.match(pattern)
    if (match) {
      const owner = match[1].toLowerCase()
      const repo  = match[2].toLowerCase()

      // Validate parts
      if (!owner || !repo) continue
      if (owner.startsWith('-') || repo.startsWith('-')) {
        throw new Error('Invalid GitHub URL: owner or repository name starts with a hyphen.')
      }

      return {
        owner,
        repo,
        fullName: `${owner}/${repo}`,
        canonicalUrl: `https://github.com/${owner}/${repo}`,
      }
    }
  }

  throw new Error(
    'Invalid GitHub URL. Expected format: https://github.com/owner/repository'
  )
}

/**
 * Validate that a URL is a syntactically valid GitHub URL.
 */
function isValidGitHubUrl(url) {
  try {
    parseGitHubUrl(url)
    return true
  } catch {
    return false
  }
}

module.exports = { parseGitHubUrl, isValidGitHubUrl }
