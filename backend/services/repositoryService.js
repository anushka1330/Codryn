'use strict'

const { parseGitHubUrl }    = require('./github/repositoryParser')
const { getRepository }     = require('./github/githubClient')
const { fetchRepositoryTree } = require('./github/repositoryTree')
const { filterFiles, fetchFileContents } = require('./github/fileFetcher')
const Repository     = require('../models/Repository')
const RepositoryFile = require('../models/RepositoryFile')

/**
 * Import a GitHub repository.
 * 
 * Flow:
 *   URL → parse → validate → GitHub metadata → tree → filter → fetch → save
 * 
 * @param {string} url - GitHub repository URL
 * @param {number|null} userId - authenticated user ID (optional)
 * @returns {object} - { repository }
 */
async function importRepository(url, userId = null) {
  // 1. Parse URL
  const { owner, repo, fullName, canonicalUrl } = parseGitHubUrl(url)

  // 2. Check if already imported
  const existing = await Repository.findByFullName(fullName)
  if (existing) {
    // Re-import: clear files and reimport
    await RepositoryFile.deleteByRepository(existing.id)
    await Repository.updateStatus(existing.id, 'importing')
    return _doImport(existing.id, owner, repo, existing)
  }

  // 3. Fetch GitHub metadata
  let ghData
  try {
    ghData = await getRepository(owner, repo)
  } catch (err) {
    if (err.status === 404) {
      throw Object.assign(new Error(`Repository "${fullName}" not found on GitHub.`), { status: 404 })
    }
    throw err
  }

  if (ghData.private) {
    // We can still try — if GITHUB_TOKEN has access it'll work
    console.warn(`[import] Note: "${fullName}" is a private repository`)
  }

  // 4. Create repository record
  const repository = await Repository.create({
    user_id:        userId,
    owner,
    name:           repo,
    full_name:      fullName,
    url:            canonicalUrl,
    description:    ghData.description || null,
    default_branch: ghData.default_branch || 'main',
    language:       ghData.language || null,
    stars:          ghData.stargazers_count || 0,
    forks:          ghData.forks_count || 0,
    status:         'importing',
  })

  return _doImport(repository.id, owner, repo, ghData)
}

async function _doImport(repositoryId, owner, repo, ghData) {
  try {
    const branch = ghData.default_branch || 'main'

    // 5. Fetch the repository tree
    let tree
    try {
      tree = await fetchRepositoryTree(owner, repo, branch)
    } catch (err) {
      // Try HEAD if branch fails
      tree = await fetchRepositoryTree(owner, repo, 'HEAD')
    }

    if (!tree || tree.length === 0) {
      await Repository.updateStatus(repositoryId, 'error', 'Repository appears to be empty.')
      throw Object.assign(new Error('Repository is empty.'), { status: 422 })
    }

    // 6. Filter to source files
    const filtered = filterFiles(tree)
    console.log(`[import] Fetching ${filtered.length} source files for repo ${repositoryId}`)

    // 7. Fetch file contents
    const files = await fetchFileContents(owner, repo, filtered)

    // 8. Save files to database
    const fileRecords = files
      .filter(f => f.content !== null)
      .map(f => ({
        repository_id: repositoryId,
        path:          f.path,
        name:          f.name,
        extension:     f.extension,
        language:      f.language,
        size:          f.size,
        content:       f.content,
      }))

    await RepositoryFile.bulkCreate(fileRecords)
    console.log(`[import] Saved ${fileRecords.length} files for repo ${repositoryId}`)

    // 9. Update status
    await Repository.updateStatus(repositoryId, 'analyzed')

    const repository = await Repository.findById(repositoryId)
    return { repository }

  } catch (err) {
    await Repository.updateStatus(repositoryId, 'error', err.message)
    throw err
  }
}

/**
 * Get all repositories (optionally for a user).
 */
async function getRepositories(userId = null) {
  return Repository.findAll(userId)
}

/**
 * Get a single repository by ID.
 */
async function getRepositoryById(id) {
  return Repository.findById(id)
}

module.exports = { importRepository, getRepositories, getRepositoryById }
