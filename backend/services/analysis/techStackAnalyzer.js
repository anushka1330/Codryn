'use strict'

/**
 * Detect tech stack from repository files.
 * 
 * Only reports technologies where there is evidence in the repository.
 * Never invents information.
 */
function analyzeTechStack(files) {
  const result = {
    languages:   [],
    frameworks:  [],
    runtime:     null,
    databases:   [],
    orms:        [],
    uiLibraries: [],
    testing:     [],
    deployment:  [],
    other:       [],
  }

  // Collect language distribution
  const langCount = {}
  for (const f of files) {
    if (f.language) {
      langCount[f.language] = (langCount[f.language] || 0) + 1
    }
  }
  result.languages = Object.entries(langCount)
    .sort((a, b) => b[1] - a[1])
    .map(([lang, count]) => ({ name: lang, fileCount: count }))

  // Build content index for detection
  const allContent = files.map(f => f.content || '').join('\n')
  const allPaths   = files.map(f => f.path)
  const pkgFile    = files.find(f => f.name === 'package.json')
  let pkg = null
  if (pkgFile?.content) {
    try { pkg = JSON.parse(pkgFile.content) } catch {}
  }

  const deps = {
    ...(pkg?.dependencies || {}),
    ...(pkg?.devDependencies || {}),
    ...(pkg?.peerDependencies || {}),
  }

  // ── RUNTIME ──
  if (hasDep(deps, 'react') || hasDep(deps, 'react-dom')) {
    result.runtime = 'Browser + Node.js'
  } else if (pkgFile || allPaths.some(p => p.endsWith('.js') || p.endsWith('.ts'))) {
    result.runtime = 'Node.js'
  }

  const pyFiles = allPaths.filter(p => p.endsWith('.py'))
  if (pyFiles.length > 5) result.runtime = 'Python'

  if (allPaths.some(p => p.endsWith('.go'))) result.runtime = 'Go'
  if (allPaths.some(p => p.endsWith('.rs'))) result.runtime = 'Rust'
  if (allPaths.some(p => p.endsWith('.java') || p.endsWith('.kt'))) result.runtime = 'JVM'

  // ── FRAMEWORKS ──
  const frameworkChecks = [
    { dep: 'next',           name: 'Next.js' },
    { dep: 'nuxt',           name: 'Nuxt.js' },
    { dep: '@angular/core',  name: 'Angular' },
    { dep: 'svelte',         name: 'Svelte' },
    { dep: '@sveltejs/kit',  name: 'SvelteKit' },
    { dep: 'astro',          name: 'Astro' },
    { dep: 'remix',          name: 'Remix' },
    { dep: 'gatsby',         name: 'Gatsby' },
    { dep: 'express',        name: 'Express.js' },
    { dep: 'fastify',        name: 'Fastify' },
    { dep: 'koa',            name: 'Koa' },
    { dep: 'hapi',           name: 'Hapi' },
    { dep: 'nestjs',         name: 'NestJS' },
    { dep: 'vite',           name: 'Vite' },
    { dep: 'react',          name: 'React' },
    { dep: 'vue',            name: 'Vue.js' },
  ]
  for (const { dep, name } of frameworkChecks) {
    if (hasDep(deps, dep)) result.frameworks.push(name)
  }

  // Python frameworks
  if (searchContent(allContent, ['from flask import', 'import flask'])) result.frameworks.push('Flask')
  if (searchContent(allContent, ['from django', 'import django'])) result.frameworks.push('Django')
  if (searchContent(allContent, ['from fastapi import', 'FastAPI()'])) result.frameworks.push('FastAPI')

  // ── DATABASES ──
  const dbChecks = [
    { patterns: ['mysql2', 'mysql'],     name: 'MySQL' },
    { patterns: ['pg', 'postgres'],      name: 'PostgreSQL' },
    { patterns: ['mongodb', 'mongoose'], name: 'MongoDB' },
    { patterns: ['sqlite3', 'better-sqlite3'], name: 'SQLite' },
    { patterns: ['redis', 'ioredis'],    name: 'Redis' },
    { patterns: ['firebase'],            name: 'Firebase' },
    { patterns: ['supabase'],            name: 'Supabase' },
    { patterns: ['dynamodb', '@aws-sdk/client-dynamodb'], name: 'DynamoDB' },
  ]
  for (const { patterns, name } of dbChecks) {
    if (patterns.some(p => hasDep(deps, p) || allContent.includes(p))) {
      result.databases.push(name)
    }
  }

  // Python DBs
  if (searchContent(allContent, ['psycopg2', 'asyncpg'])) result.databases.push('PostgreSQL')
  if (searchContent(allContent, ['pymongo'])) result.databases.push('MongoDB')
  if (searchContent(allContent, ['sqlalchemy'])) result.databases.push('SQLAlchemy (ORM)')

  // ── ORMS ──
  const ormChecks = [
    { dep: 'prisma',     name: 'Prisma' },
    { dep: '@prisma/client', name: 'Prisma' },
    { dep: 'sequelize',  name: 'Sequelize' },
    { dep: 'typeorm',    name: 'TypeORM' },
    { dep: 'knex',       name: 'Knex.js' },
    { dep: 'drizzle-orm', name: 'Drizzle ORM' },
    { dep: 'mongoose',   name: 'Mongoose' },
  ]
  for (const { dep, name } of ormChecks) {
    if (hasDep(deps, dep) && !result.orms.includes(name)) result.orms.push(name)
  }

  // ── UI LIBRARIES ──
  const uiChecks = [
    { dep: 'tailwindcss',      name: 'Tailwind CSS' },
    { dep: '@mui/material',    name: 'Material UI' },
    { dep: 'antd',             name: 'Ant Design' },
    { dep: 'chakra-ui',        name: 'Chakra UI' },
    { dep: '@radix-ui',        name: 'Radix UI' },
    { dep: 'shadcn',           name: 'shadcn/ui' },
    { dep: 'styled-components', name: 'Styled Components' },
    { dep: '@emotion/react',   name: 'Emotion' },
    { dep: 'framer-motion',    name: 'Framer Motion' },
    { dep: 'lucide-react',     name: 'Lucide React' },
  ]
  for (const { dep, name } of uiChecks) {
    if (Object.keys(deps).some(d => d.startsWith(dep))) result.uiLibraries.push(name)
  }

  // ── TESTING ──
  const testChecks = [
    { dep: 'jest',      name: 'Jest' },
    { dep: 'vitest',    name: 'Vitest' },
    { dep: 'mocha',     name: 'Mocha' },
    { dep: 'cypress',   name: 'Cypress' },
    { dep: 'playwright', name: 'Playwright' },
    { dep: '@testing-library/react', name: 'Testing Library' },
    { dep: 'jasmine',   name: 'Jasmine' },
  ]
  for (const { dep, name } of testChecks) {
    if (hasDep(deps, dep)) result.testing.push(name)
  }

  // ── DEPLOYMENT ──
  if (allPaths.some(p => p.includes('Dockerfile'))) result.deployment.push('Docker')
  if (allPaths.some(p => p.includes('docker-compose'))) result.deployment.push('Docker Compose')
  if (allPaths.some(p => p.includes('vercel.json') || p.includes('.vercel'))) result.deployment.push('Vercel')
  if (allPaths.some(p => p.includes('netlify.toml') || p.includes('.netlify'))) result.deployment.push('Netlify')
  if (allPaths.some(p => p.includes('railway.toml'))) result.deployment.push('Railway')
  if (allPaths.some(p => p.includes('render.yaml'))) result.deployment.push('Render')
  if (allPaths.some(p => p.includes('.github/workflows'))) result.deployment.push('GitHub Actions')
  if (allPaths.some(p => p.includes('.gitlab-ci.yml'))) result.deployment.push('GitLab CI/CD')
  if (allPaths.some(p => p.includes('k8s') || p.includes('kubernetes'))) result.deployment.push('Kubernetes')

  return result
}

function hasDep(deps, name) {
  return Object.keys(deps).some(d => d === name || d.startsWith(`${name}/`))
}

function searchContent(content, patterns) {
  return patterns.some(p => content.includes(p))
}

module.exports = { analyzeTechStack }
