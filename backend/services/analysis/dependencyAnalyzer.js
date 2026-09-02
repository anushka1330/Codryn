'use strict'

/**
 * Analyze dependencies from package.json or requirements.txt.
 */
function analyzeDependencies(files) {
  const result = {
    production: [],
    development: [],
    total: 0,
    notable: [],
  }

  // Node.js — package.json
  const pkgFile = files.find(f => f.name === 'package.json' && !f.path.includes('node_modules'))
  if (pkgFile?.content) {
    try {
      const pkg = JSON.parse(pkgFile.content)
      const prod = Object.entries(pkg.dependencies || {}).map(([name, version]) => ({ name, version }))
      const dev  = Object.entries(pkg.devDependencies || {}).map(([name, version]) => ({ name, version }))

      result.production = prod
      result.development = dev
      result.total = prod.length + dev.length

      // Notable packages
      const notable = [
        ...prod.filter(d => NOTABLE_PACKAGES.has(d.name)),
        ...dev.filter(d => NOTABLE_PACKAGES.has(d.name)),
      ]
      result.notable = notable.map(d => ({
        name:    d.name,
        version: d.version,
        purpose: PACKAGE_PURPOSES[d.name] || 'Library',
      }))
    } catch {}
  }

  // Python — requirements.txt
  const reqFile = files.find(f => f.name === 'requirements.txt')
  if (reqFile?.content) {
    const lines = reqFile.content.split('\n').filter(l => l.trim() && !l.startsWith('#'))
    result.production = lines.map(l => {
      const [name, version] = l.split(/[=><~!]/)
      return { name: name.trim(), version: version?.trim() || '' }
    })
    result.total = result.production.length
  }

  return result
}

const NOTABLE_PACKAGES = new Set([
  'react', 'react-dom', 'next', 'vue', 'nuxt', 'svelte',
  'express', 'fastify', 'koa', 'nestjs',
  'prisma', '@prisma/client', 'sequelize', 'typeorm', 'mongoose',
  'mysql2', 'pg', 'mongodb', 'redis', 'ioredis',
  'jest', 'vitest', 'cypress', 'playwright',
  'tailwindcss', '@mui/material', 'styled-components',
  'axios', 'node-fetch', 'got',
  'jsonwebtoken', 'passport', 'bcrypt', 'bcryptjs',
  'stripe', '@stripe/stripe-js',
  'aws-sdk', '@aws-sdk/client-s3',
  'socket.io', 'ws',
  'graphql', '@apollo/server', '@apollo/client',
  'trpc', '@trpc/server',
  'zod', 'joi', 'yup',
  'dotenv', 'cors', 'helmet',
])

const PACKAGE_PURPOSES = {
  'react':           'UI Library',
  'next':            'Full-stack React framework',
  'vue':             'UI Framework',
  'nuxt':            'Full-stack Vue framework',
  'express':         'Web server',
  'fastify':         'Web server',
  'prisma':          'ORM + database toolkit',
  'sequelize':       'SQL ORM',
  'mongoose':        'MongoDB ODM',
  'mysql2':          'MySQL driver',
  'pg':              'PostgreSQL driver',
  'redis':           'Redis client',
  'jest':            'Testing framework',
  'vitest':          'Testing framework',
  'cypress':         'E2E testing',
  'playwright':      'E2E testing',
  'jsonwebtoken':    'JWT authentication',
  'passport':        'Authentication middleware',
  'bcrypt':          'Password hashing',
  'bcryptjs':        'Password hashing',
  'stripe':          'Payment processing',
  'socket.io':       'Real-time WebSockets',
  'graphql':         'GraphQL',
  'zod':             'Schema validation',
  'cors':            'CORS middleware',
  'helmet':          'Security headers',
  'dotenv':          'Environment variables',
  'tailwindcss':     'CSS framework',
  'axios':           'HTTP client',
}

module.exports = { analyzeDependencies }
