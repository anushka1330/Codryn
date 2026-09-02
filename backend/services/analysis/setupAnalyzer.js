'use strict'

/**
 * Generate setup instructions from repository analysis.
 * Based on detected tech stack and configuration files.
 */
function analyzeSetup(files, techStack) {
  const steps = []
  const allPaths = files.map(f => f.path)

  // 1. Clone
  steps.push({
    step: 1,
    title: 'Clone the repository',
    command: 'git clone <repository-url>\ncd <repository-name>',
  })

  // 2. Install dependencies
  if (files.some(f => f.name === 'package.json')) {
    const hasYarn = allPaths.some(p => p.endsWith('yarn.lock'))
    const hasPnpm = allPaths.some(p => p.endsWith('pnpm-lock.yaml'))
    const cmd = hasPnpm ? 'pnpm install' : hasYarn ? 'yarn install' : 'npm install'
    steps.push({
      step: 2,
      title: 'Install Node.js dependencies',
      command: cmd,
    })
  }

  if (files.some(f => f.name === 'requirements.txt')) {
    steps.push({
      step: 2,
      title: 'Install Python dependencies',
      command: 'pip install -r requirements.txt\n# Or with a virtual environment:\npython -m venv venv\nsource venv/bin/activate\npip install -r requirements.txt',
    })
  }

  if (files.some(f => f.name === 'go.mod')) {
    steps.push({ step: 2, title: 'Install Go dependencies', command: 'go mod download' })
  }

  // 3. Environment variables
  const envFile = files.find(f => f.name === '.env.example' || f.name === '.env.sample')
  if (envFile) {
    steps.push({
      step: 3,
      title: 'Configure environment variables',
      command: `cp ${envFile.name} .env\n# Edit .env with your values`,
      note: 'Required environment variables were detected in the repository.',
    })
  }

  // 4. Database setup
  if (techStack?.databases?.length > 0) {
    const hasMigrations = allPaths.some(p => /migrations?\//i.test(p))
    const hasPrisma = files.some(f => f.name === 'schema.prisma')
    const hasSequelize = techStack.orms?.includes('Sequelize')

    if (hasPrisma) {
      steps.push({
        step: 4,
        title: 'Set up database (Prisma)',
        command: 'npx prisma migrate dev\n# Or for production:\nnpx prisma migrate deploy',
      })
    } else if (hasSequelize) {
      steps.push({
        step: 4,
        title: 'Set up database (Sequelize)',
        command: 'npx sequelize-cli db:migrate',
      })
    } else if (hasMigrations) {
      steps.push({
        step: 4,
        title: 'Run database migrations',
        command: 'npm run migrate\n# Check package.json scripts for the exact command',
      })
    }
  }

  // 5. Run
  const pkgFile = files.find(f => f.name === 'package.json')
  if (pkgFile?.content) {
    try {
      const pkg = JSON.parse(pkgFile.content)
      const scripts = pkg.scripts || {}
      const devScript = scripts.dev ? 'npm run dev' : scripts.start ? 'npm start' : null
      if (devScript) {
        steps.push({ step: steps.length + 1, title: 'Start the development server', command: devScript })
      }
    } catch {}
  }

  if (files.some(f => f.name === 'manage.py')) {
    steps.push({
      step: steps.length + 1,
      title: 'Start Django development server',
      command: 'python manage.py runserver',
    })
  }

  return { steps }
}

module.exports = { analyzeSetup }
