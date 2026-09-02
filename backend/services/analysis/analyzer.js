'use strict'

const { analyzeTechStack }    = require('./techStackAnalyzer')
const { analyzeArchitecture } = require('./architectureAnalyzer')
const { analyzeDependencies } = require('./dependencyAnalyzer')
const { analyzeAPIs }         = require('./apiAnalyzer')
const { analyzeDatabase }     = require('./databaseAnalyzer')
const { analyzeAuth }         = require('./authAnalyzer')
const { analyzeDeployment }   = require('./deploymentAnalyzer')
const { analyzeSetup }        = require('./setupAnalyzer')
const { analyzeProjectHealth } = require('./healthAnalyzer')

/**
 * Run the full analysis pipeline on a set of repository files.
 * 
 * @param {Array} files - repository_files records (with content)
 * @returns {object} - full analysis result
 */
async function analyzeRepository(files) {
  console.log(`[analyzer] Starting analysis of ${files.length} files`)

  // Run all analyzers
  const techStack    = analyzeTechStack(files)
  const architecture = analyzeArchitecture(files)
  const dependencies = analyzeDependencies(files)
  const apis         = analyzeAPIs(files)
  const database     = analyzeDatabase(files)
  const authentication = analyzeAuth(files)
  const deployment   = analyzeDeployment(files)
  const setup        = analyzeSetup(files, techStack)
  const projectHealth = analyzeProjectHealth(files, techStack)

  console.log(`[analyzer] Analysis complete`)

  return {
    tech_stack:    techStack,
    architecture,
    dependencies,
    apis,
    database_info: database,
    authentication,
    deployment,
    setup,
    project_health: projectHealth,
  }
}

module.exports = { analyzeRepository }
