'use strict'

/**
 * Analyze repository architecture.
 * Identifies layers and component types from file structure.
 */
function analyzeArchitecture(files) {
  const paths = files.map(f => f.path)

  const layers = []
  const components = []

  // ── LAYER DETECTION ──

  // Frontend
  if (paths.some(p => /\.(jsx|tsx|vue|svelte)$/i.test(p))) {
    layers.push({
      name: 'Frontend',
      type: 'frontend',
      description: 'User interface components and pages',
      files: paths.filter(p => /\.(jsx|tsx|vue|svelte)$/i.test(p)).slice(0, 5),
    })
  }

  // Backend API
  const backendPatterns = [
    /routes?\//i, /controllers?\//i, /api\//i, /server\.(js|ts)$/i,
    /app\.(js|ts)$/i, /index\.(js|ts)$/i,
  ]
  if (paths.some(p => backendPatterns.some(pat => pat.test(p)))) {
    layers.push({
      name: 'Backend API',
      type: 'backend',
      description: 'Server-side routes, controllers, and middleware',
      files: paths.filter(p => backendPatterns.some(pat => pat.test(p))).slice(0, 5),
    })
  }

  // Services layer
  if (paths.some(p => /services?\//i.test(p))) {
    layers.push({
      name: 'Services',
      type: 'services',
      description: 'Business logic and external integrations',
      files: paths.filter(p => /services?\//i.test(p)).slice(0, 5),
    })
  }

  // Database / Models
  if (paths.some(p => /models?\//i.test(p) || /schemas?\//i.test(p))) {
    layers.push({
      name: 'Data Layer',
      type: 'database',
      description: 'Database models, schemas, and data access',
      files: paths.filter(p => /models?\//i.test(p) || /schemas?\//i.test(p)).slice(0, 5),
    })
  }

  // Middleware
  if (paths.some(p => /middlewares?\//i.test(p))) {
    layers.push({
      name: 'Middleware',
      type: 'middleware',
      description: 'Request/response middleware and guards',
      files: paths.filter(p => /middlewares?\//i.test(p)).slice(0, 5),
    })
  }

  // Utils/Helpers
  if (paths.some(p => /utils?\//i.test(p) || /helpers?\//i.test(p) || /lib\//i.test(p))) {
    layers.push({
      name: 'Utilities',
      type: 'utils',
      description: 'Shared utilities, helpers, and constants',
      files: paths.filter(p => /utils?\//i.test(p) || /helpers?\//i.test(p)).slice(0, 5),
    })
  }

  // Hooks
  if (paths.some(p => /hooks?\//i.test(p))) {
    layers.push({
      name: 'Hooks',
      type: 'hooks',
      description: 'React/framework custom hooks',
      files: paths.filter(p => /hooks?\//i.test(p)).slice(0, 5),
    })
  }

  // Config
  if (paths.some(p => /config\//i.test(p) || /configuration\//i.test(p))) {
    layers.push({
      name: 'Configuration',
      type: 'config',
      description: 'Application configuration files',
      files: paths.filter(p => /config\//i.test(p)).slice(0, 5),
    })
  }

  // Tests
  if (paths.some(p => /__(tests?|specs?)__\//i.test(p) || /\.test\.|\.spec\./i.test(p))) {
    layers.push({
      name: 'Tests',
      type: 'testing',
      description: 'Unit, integration, and end-to-end tests',
      files: paths.filter(p => /\.(test|spec)\.[jt]sx?$/i.test(p)).slice(0, 5),
    })
  }

  // ── PATTERN DETECTION ──
  const patterns = []

  if (paths.some(p => /routes?\//i.test(p)) && paths.some(p => /controllers?\//i.test(p))) {
    patterns.push('MVC (Model-View-Controller)')
  }
  if (paths.some(p => /pages?\//i.test(p)) && paths.some(p => /components?\//i.test(p))) {
    patterns.push('Component-based architecture')
  }
  if (paths.some(p => /store\//i.test(p) || /redux/i.test(p) || /zustand/i.test(p))) {
    patterns.push('Centralized state management')
  }
  if (paths.some(p => /microservices?\//i.test(p))) {
    patterns.push('Microservices')
  }

  return {
    layers,
    patterns,
    totalFiles: files.length,
    summary: layers.map(l => l.name).join(' → '),
  }
}

module.exports = { analyzeArchitecture }
