'use strict'

/**
 * Detect deployment configuration.
 */
function analyzeDeployment(files) {
  const result = {
    platforms:  [],
    cicd:       [],
    containers: [],
    configs:    [],
  }

  const allPaths = files.map(f => f.path)

  // Container
  if (allPaths.some(p => /dockerfile/i.test(p))) {
    result.containers.push('Docker')
    result.configs.push(allPaths.find(p => /dockerfile/i.test(p)))
  }
  if (allPaths.some(p => /docker-compose/i.test(p))) {
    result.containers.push('Docker Compose')
    result.configs.push(allPaths.find(p => /docker-compose/i.test(p)))
  }
  if (allPaths.some(p => /kubernetes|k8s/i.test(p))) {
    result.containers.push('Kubernetes')
  }

  // Platforms
  const platformChecks = [
    { pattern: /vercel\.json$/i,           name: 'Vercel' },
    { pattern: /netlify\.toml$/i,          name: 'Netlify' },
    { pattern: /railway\.toml$/i,          name: 'Railway' },
    { pattern: /render\.yaml$/i,           name: 'Render' },
    { pattern: /fly\.toml$/i,              name: 'Fly.io' },
    { pattern: /\.heroku/i,                name: 'Heroku' },
    { pattern: /Procfile$/,               name: 'Heroku' },
    { pattern: /appengine|app\.yaml$/i,    name: 'Google Cloud App Engine' },
    { pattern: /\.ebextensions/i,          name: 'AWS Elastic Beanstalk' },
    { pattern: /samconfig|template\.yaml$/i, name: 'AWS SAM' },
    { pattern: /serverless\.yml$/i,        name: 'Serverless Framework' },
    { pattern: /amplify\.yml$/i,           name: 'AWS Amplify' },
    { pattern: /azure-pipelines/i,         name: 'Azure' },
    { pattern: /\.github\/workflows/i,     name: 'GitHub Actions' },
    { pattern: /\.gitlab-ci\.yml$/i,       name: 'GitLab CI/CD' },
    { pattern: /\.circleci/i,              name: 'CircleCI' },
    { pattern: /Jenkinsfile/i,             name: 'Jenkins' },
    { pattern: /\.travis\.yml$/i,          name: 'Travis CI' },
  ]

  for (const { pattern, name } of platformChecks) {
    if (allPaths.some(p => pattern.test(p))) {
      if (name.includes('CI') || name.includes('Actions') || name.includes('Jenkins') || name.includes('Travis')) {
        if (!result.cicd.includes(name)) result.cicd.push(name)
      } else {
        if (!result.platforms.includes(name)) result.platforms.push(name)
      }
    }
  }

  return result
}

module.exports = { analyzeDeployment }
