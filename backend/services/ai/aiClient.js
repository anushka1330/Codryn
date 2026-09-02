'use strict'

const { GoogleGenerativeAI } = require('@google/generative-ai')

let client = null

function getClient() {
  if (!client) {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set. Configure it in your .env file.')
    }
    client = new GoogleGenerativeAI(apiKey)
  }
  return client
}

/**
 * Generate text using Gemini.
 * 
 * @param {string} prompt - the full prompt
 * @param {object} options
 * @param {string} options.model - Gemini model name (default: gemini-1.5-flash)
 * @param {number} options.maxTokens - max output tokens
 * @returns {Promise<string>} - generated text
 */
async function generateText(prompt, { model = 'gemini-3.6-flash', maxTokens = 2048 } = {}) {
  const genAI = getClient()
  const genModel = genAI.getGenerativeModel({
    model,
    generationConfig: {
      maxOutputTokens: maxTokens,
      temperature: 0.3,
    },
  })

  const result = await genModel.generateContent(prompt)
  const response = result.response
  return response.text()
}

/**
 * Check if the AI service is available.
 */
function isAvailable() {
  return !!process.env.GEMINI_API_KEY
}

module.exports = { generateText, isAvailable }
