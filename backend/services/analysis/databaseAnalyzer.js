'use strict'

/**
 * Detect database models, schemas, and ORM usage.
 */
function analyzeDatabase(files) {
  const models = []
  const schemas = []
  const sqlTables = []

  for (const file of files) {
    if (!file.content) continue

    // Mongoose models
    if (/mongoose/i.test(file.content)) {
      const schemaMatches = file.content.matchAll(/new\s+(?:mongoose\.)?Schema\s*\(/gi)
      const modelMatches  = file.content.matchAll(/mongoose\.model\s*\(\s*['"`](\w+)['"`]/gi)
      for (const m of modelMatches) {
        models.push({ name: m[1], type: 'Mongoose', file: file.path })
      }
    }

    // Prisma models
    if (file.name === 'schema.prisma' && file.content) {
      const prismaModels = file.content.matchAll(/^model\s+(\w+)\s*\{/gm)
      for (const m of prismaModels) {
        models.push({ name: m[1], type: 'Prisma', file: file.path })
      }
    }

    // Sequelize models
    if (/sequelize/i.test(file.content)) {
      const seqMatches = file.content.matchAll(/(\w+)\.define\s*\(\s*['"`](\w+)['"`]/gi)
      for (const m of seqMatches) {
        models.push({ name: m[2], type: 'Sequelize', file: file.path })
      }
    }

    // TypeORM entities
    if (/@Entity/i.test(file.content)) {
      const entityMatch = file.content.match(/class\s+(\w+)/)
      if (entityMatch) {
        models.push({ name: entityMatch[1], type: 'TypeORM Entity', file: file.path })
      }
    }

    // SQLAlchemy (Python)
    if (/Base\.metadata|DeclarativeBase|db\.Model/i.test(file.content)) {
      const classMatch = file.content.matchAll(/class\s+(\w+)\s*\([^)]*(?:Base|Model|db\.Model)[^)]*\)/gi)
      for (const m of classMatch) {
        models.push({ name: m[1], type: 'SQLAlchemy', file: file.path })
      }
    }

    // SQL files
    if (file.extension === '.sql') {
      const tableMatches = file.content.matchAll(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?[`"']?(\w+)[`"']?/gi)
      for (const m of tableMatches) {
        sqlTables.push({ name: m[1], file: file.path })
      }
    }
  }

  // Deduplicate models
  const seen = new Set()
  const uniqueModels = models.filter(m => {
    const key = m.name
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  return {
    models:    uniqueModels,
    sqlTables: sqlTables,
    total:     uniqueModels.length + sqlTables.length,
  }
}

module.exports = { analyzeDatabase }
