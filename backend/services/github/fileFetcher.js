'use strict'

const { getFileContent } = require('./githubClient')

// ── IGNORE PATTERNS ──────────────────────────────────────────────────────────

const IGNORED_DIRS = new Set([
  'node_modules', '.git', 'dist', 'build', 'out', 'output', '.next', '.nuxt',
  'coverage', '.nyc_output', 'vendor', '__pycache__', '.pytest_cache',
  '.cache', '.parcel-cache', '.turbo', '.svelte-kit', 'target', 'bin',
  '.venv', 'venv', 'env', '.tox', '.eggs', 'elm-stuff',
])

const IGNORED_EXTENSIONS = new Set([
  // Binary/media
  '.png', '.jpg', '.jpeg', '.gif', '.ico', '.svg', '.webp', '.bmp', '.tiff',
  '.mp4', '.mp3', '.wav', '.ogg', '.avi', '.mov', '.webm',
  '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
  '.zip', '.tar', '.gz', '.rar', '.7z', '.bz2',
  '.exe', '.dll', '.so', '.dylib', '.bin', '.wasm',
  '.ttf', '.woff', '.woff2', '.eot', '.otf',
  // Lock files / generated
  '.lock', '.snap',
  // Compiled
  '.pyc', '.pyo', '.class', '.o',
  // DB files
  '.db', '.sqlite', '.sqlite3',
])

const IGNORED_FILES = new Set([
  'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', 'composer.lock',
  'Podfile.lock', 'Gemfile.lock', '.DS_Store', 'Thumbs.db',
  '.gitignore', '.gitattributes', '.editorconfig',
])

// Max file size to fetch (100 KB)
const MAX_FILE_SIZE = 100 * 1024

// Max number of source files to import
const MAX_FILES = 300

// Source code extensions we care about
const SOURCE_EXTENSIONS = new Set([
  '.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs',
  '.py', '.rb', '.go', '.rs', '.java', '.kt', '.swift',
  '.c', '.cpp', '.cc', '.h', '.hpp',
  '.cs', '.php', '.scala', '.elm', '.ex', '.exs',
  '.vue', '.svelte', '.astro',
  '.css', '.scss', '.sass', '.less',
  '.html', '.htm', '.ejs', '.hbs', '.njk',
  '.json', '.yaml', '.yml', '.toml', '.env.example',
  '.md', '.txt', '.sh', '.bash', '.zsh', '.fish',
  '.sql', '.graphql', '.gql', '.prisma',
  '.tf', '.hcl', '.dockerfile',
])

// Config/metadata files to always include
const ALWAYS_INCLUDE = new Set([
  'package.json', 'tsconfig.json', 'vite.config.js', 'vite.config.ts',
  'next.config.js', 'next.config.ts', 'webpack.config.js',
  'Dockerfile', 'docker-compose.yml', 'docker-compose.yaml',
  '.env.example', 'README.md', 'requirements.txt', 'Pipfile',
  'go.mod', 'Cargo.toml', 'pom.xml', 'build.gradle',
  'vercel.json', 'netlify.toml', 'render.yaml', 'railway.toml',
  '.github/workflows',
])

// ── FILTER ────────────────────────────────────────────────────────────────────

function shouldInclude(entry) {
  if (entry.type !== 'blob') return false

  const path  = entry.path
  const parts = path.split('/')
  const name  = parts[parts.length - 1]

  // Check ignored directories
  for (const part of parts.slice(0, -1)) {
    if (IGNORED_DIRS.has(part) || part.startsWith('.')) {
      // Allow .github/workflows
      if (part === '.github') continue
      return false
    }
  }

  // Always include certain files
  if (ALWAYS_INCLUDE.has(name)) return true
  if ([...ALWAYS_INCLUDE].some(p => path.includes(p))) return true

  // Ignore certain filenames
  if (IGNORED_FILES.has(name)) return false

  // Check extension
  const lastDot = name.lastIndexOf('.')
  if (lastDot === -1) return false // no extension
  const ext = name.slice(lastDot).toLowerCase()

  if (IGNORED_EXTENSIONS.has(ext)) return false
  if (!SOURCE_EXTENSIONS.has(ext)) return false

  // Skip very large files
  if (entry.size > MAX_FILE_SIZE) return false

  return true
}

/**
 * Filter flat tree to only relevant source files.
 */
function filterFiles(tree) {
  const filtered = tree.filter(shouldInclude)

  if (filtered.length > MAX_FILES) {
    console.warn(`[fetcher] Repository has ${filtered.length} matching files — limiting to ${MAX_FILES}`)
    return filtered.slice(0, MAX_FILES)
  }

  return filtered
}

/**
 * Fetch content for a list of file entries.
 * Fetches in parallel with a concurrency limit.
 */
async function fetchFileContents(owner, repo, files, { concurrency = 10 } = {}) {
  const results = []

  for (let i = 0; i < files.length; i += concurrency) {
    const batch = files.slice(i, i + concurrency)
    const fetched = await Promise.all(
      batch.map(async (file) => {
        const content = await getFileContent(owner, repo, file.path)
        const name = file.path.split('/').pop()
        const lastDot = name.lastIndexOf('.')
        const extension = lastDot >= 0 ? name.slice(lastDot).toLowerCase() : null
        return {
          path:      file.path,
          name,
          extension,
          language:  extensionToLanguage(extension),
          size:      file.size || (content ? Buffer.byteLength(content) : 0),
          content,
        }
      })
    )
    results.push(...fetched)
    console.log(`[fetcher] Fetched ${Math.min(i + concurrency, files.length)}/${files.length} files`)
  }

  return results
}

// Simple extension → language map
function extensionToLanguage(ext) {
  const map = [
    [['.js', '.jsx', '.mjs', '.cjs'], 'JavaScript'],
    [['.ts', '.tsx'],                  'TypeScript'],
    [['.py'],                          'Python'],
    [['.rb'],                          'Ruby'],
    [['.go'],                          'Go'],
    [['.rs'],                          'Rust'],
    [['.java'],                        'Java'],
    [['.kt'],                          'Kotlin'],
    [['.swift'],                       'Swift'],
    [['.c', '.h'],                     'C'],
    [['.cpp', '.cc', '.hpp'],          'C++'],
    [['.cs'],                          'C#'],
    [['.php'],                         'PHP'],
    [['.vue'],                         'Vue'],
    [['.svelte'],                      'Svelte'],
    [['.css', '.scss', '.sass'],       'CSS'],
    [['.html', '.htm'],                'HTML'],
    [['.json'],                        'JSON'],
    [['.yaml', '.yml'],                'YAML'],
    [['.md'],                          'Markdown'],
    [['.sql'],                         'SQL'],
    [['.graphql', '.gql'],             'GraphQL'],
    [['.sh', '.bash'],                 'Shell'],
  ]
  if (!ext) return null
  for (const [exts, lang] of map) {
    if (exts.includes(ext)) return lang
  }
  return null
}

module.exports = { filterFiles, fetchFileContents, shouldInclude }
