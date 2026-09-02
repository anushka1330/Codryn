'use strict'

/**
 * Build prompts for different AI tasks.
 */

const SYSTEM_PROMPT = `You are Codryn, an AI repository intelligence assistant.
You help developers understand codebases by answering questions grounded in actual repository code.
Rules:
- Only answer based on the repository context provided.
- Never invent files, functions, or functionality that aren't in the context.
- If the information isn't available in the context, say so clearly.
- Be concise but complete. Format answers with markdown when helpful.
- Reference specific files and line numbers when possible.`

/**
 * Build a chat prompt for repository questions.
 */
function buildChatPrompt(repositoryContext, question, history = []) {
  const historyText = history.slice(-6).map(m =>
    `${m.role === 'user' ? 'Developer' : 'Codryn'}: ${m.content}`
  ).join('\n\n')

  return `${SYSTEM_PROMPT}

---
REPOSITORY CONTEXT:
${repositoryContext}
---
${historyText ? `CONVERSATION HISTORY:\n${historyText}\n---` : ''}

Developer question: ${question}

Codryn answer:`
}

/**
 * Build a prompt for feature tracing.
 */
function buildTracePrompt(repositoryContext, feature) {
  return `${SYSTEM_PROMPT}

---
REPOSITORY CONTEXT:
${repositoryContext}
---

The developer wants to understand how "${feature}" works in this codebase.

Trace the complete flow from the user interface (if applicable) through to the data layer.
Format as a numbered flow:
1. [Component/File] — what happens
2. [Component/File] — what happens
...

Only include steps that have evidence in the repository context. Do not invent steps.`
}

/**
 * Build a prompt for explaining why a file/function exists.
 */
function buildExplainPrompt(repositoryContext, target) {
  return `${SYSTEM_PROMPT}

---
REPOSITORY CONTEXT:
${repositoryContext}
---

Explain the following in this codebase: "${target}"

Cover:
1. Purpose — what does it do?
2. Role — where does it fit in the architecture?
3. Why it exists — what problem does it solve?
4. What depends on it — what other parts use it?
5. What it depends on — what does it import/call?
6. What could change — what would break if this changed?`
}

/**
 * Build a prompt for change impact analysis.
 */
function buildImpactPrompt(repositoryContext, targetFile) {
  return `${SYSTEM_PROMPT}

---
REPOSITORY CONTEXT:
${repositoryContext}
---

Analyze the potential impact of changing: "${targetFile}"

Based on the repository context, identify:
1. Direct dependents (files that import or call this)
2. Related components (UI or service components that use it)
3. Related APIs (routes that may be affected)
4. Related database models (if applicable)
5. Features that may be affected

Clearly label this as an estimate based on repository analysis.`
}

module.exports = { buildChatPrompt, buildTracePrompt, buildExplainPrompt, buildImpactPrompt }
