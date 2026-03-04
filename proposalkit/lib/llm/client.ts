import OpenAI from 'openai'

let _client: OpenAI | null = null

export function getLLMClient(): OpenAI {
  if (!_client) {
    _client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
    })
  }
  return _client
}

export function getModel(): string {
  return process.env.OPENAI_MODEL || 'gpt-4o-mini'
}
