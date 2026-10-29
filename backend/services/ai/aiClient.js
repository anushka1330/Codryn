'use strict'

const dns = require('dns')
try {
  dns.setDefaultResultOrder('ipv4first')
} catch {}

const nodeFetch = require('node-fetch')

// Priority list of fast, capable Google Gemini models for code intelligence
const CANDIDATE_MODELS = [
  'gemini-3-flash-preview',
  'gemini-3.5-flash',
  'gemini-3.5-flash-lite',
  'gemini-3.8-flash',
]

/**
 * Check if the Gemini AI service is configured.
 */
function isAvailable() {
  return !!process.env.GEMINI_API_KEY
}

/**
 * Generate text using Gemini with multi-model failover, resilient network handling,
 * and granular error classification.
 *
 * @param {string} prompt - the full prompt
 * @param {object} options
 * @param {string} [options.model] - preferred model name
 * @param {number} [options.maxTokens] - max output tokens (default: 2048)
 * @param {number} [options.timeoutMs] - per-request timeout in ms (default: 20000)
 * @returns {Promise<string>} - generated text
 */
async function generateText(prompt, { model, maxTokens = 2048, timeoutMs = 20000 } = {}) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    const err = new Error('GEMINI_API_KEY is not configured on the server. Please set it in your .env file.')
    err.status = 503
    throw err
  }

  // Build model attempt list with preferred model first
  const modelsToTry = []
  if (model && !modelsToTry.includes(model)) {
    modelsToTry.push(model)
  }
  for (const m of CANDIDATE_MODELS) {
    if (!modelsToTry.includes(m)) {
      modelsToTry.push(m)
    }
  }

  let lastStatus = null
  let lastMessage = null

  for (let i = 0; i < modelsToTry.length; i++) {
    const currentModel = modelsToTry[i]
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${currentModel}:generateContent?key=${apiKey}`

    try {
      const response = await nodeFetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            maxOutputTokens: maxTokens,
            temperature: 0.3,
          },
        }),
        timeout: timeoutMs,
      })

      const data = await response.json().catch(() => ({}))

      if (response.status === 200) {
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text
        if (text) {
          return text
        }
        // If response was 200 but content parts are empty (e.g. safety blocks)
        throw new Error('Gemini returned an empty response. The prompt may have triggered content safety filters.')
      }

      lastStatus = response.status
      lastMessage = data.error?.message || `HTTP ${response.status}`

      // Fatal authentication errors should not retry other models
      if (response.status === 401 || response.status === 403) {
        const authErr = new Error('Gemini API authentication failed. Please verify your GEMINI_API_KEY in backend/.env.')
        authErr.status = 401
        throw authErr
      }

      // If rate limited (429) or high demand (503) or not found (404), log and try next model
      console.warn(`[Gemini] Model ${currentModel} returned ${response.status} (${lastMessage.slice(0, 80)}). Trying fallback model...`)
    } catch (err) {
      if (err.status === 401) throw err

      if (err.name === 'FetchError' && err.type === 'request-timeout') {
        console.warn(`[Gemini] Request to ${currentModel} timed out after ${timeoutMs}ms. Trying fallback model...`)
        lastStatus = 504
        lastMessage = `Request to ${currentModel} timed out after ${Math.round(timeoutMs / 1000)}s`
      } else {
        console.warn(`[Gemini] Model ${currentModel} network error: ${err.message}. Trying fallback model...`)
        lastMessage = err.message
      }
    }
  }

  // All candidate models exhausted; classify the error appropriately
  const finalError = new Error(
    lastStatus === 429
      ? 'Gemini API rate limit or quota exceeded. Please wait a moment before trying again.'
      : lastStatus === 503
      ? 'Gemini AI service is currently experiencing high demand across available models. Please retry shortly.'
      : lastStatus === 504
      ? `AI generation timed out after ${Math.round(timeoutMs / 1000)}s due to network latency. Please try again.`
      : `AI generation failed: ${lastMessage || 'All Gemini models were unavailable.'}`
  )
  finalError.status = lastStatus === 429 ? 429 : lastStatus === 504 ? 504 : 502
  throw finalError
}

module.exports = { generateText, isAvailable }
