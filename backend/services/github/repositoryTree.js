'use strict'

const { getTree } = require('./githubClient')

/**
 * Retrieve the repository file tree.
 * Returns an array of file/directory entries.
 */
async function fetchRepositoryTree(owner, repo, branch = 'HEAD') {
  const data = await getTree(owner, repo, branch)

  if (!data.tree || !Array.isArray(data.tree)) {
    throw new Error('Repository is empty or tree could not be fetched.')
  }

  if (data.truncated) {
    console.warn(`[tree] Warning: repository tree was truncated for ${owner}/${repo}`)
  }

  return data.tree.map(entry => ({
    path:  entry.path,
    type:  entry.type,  // 'blob' | 'tree'
    size:  entry.size || 0,
    sha:   entry.sha,
    mode:  entry.mode,
  }))
}

/**
 * Build a nested directory structure from a flat tree.
 */
function buildDirectoryTree(flatTree) {
  const root = { name: '/', type: 'tree', children: [] }
  const lookup = { '': root }

  for (const entry of flatTree) {
    const parts = entry.path.split('/')
    let current = root

    for (let i = 0; i < parts.length; i++) {
      const partPath = parts.slice(0, i + 1).join('/')
      if (!lookup[partPath]) {
        const node = {
          name:     parts[i],
          path:     partPath,
          type:     i === parts.length - 1 ? entry.type : 'tree',
          size:     entry.size,
          children: [],
        }
        lookup[partPath] = node
        current.children.push(node)
      }
      current = lookup[partPath]
    }
  }

  return root
}

module.exports = { fetchRepositoryTree, buildDirectoryTree }
