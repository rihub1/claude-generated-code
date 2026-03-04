import type { OneShotFormData, WizardFormData, BrandKit } from '@/types'

export const SYSTEM_PROMPT = `You are a professional proposal writer for agencies. Your task is to generate a structured business proposal in valid JSON format.

RULES (strictly enforce):
1. Return ONLY valid JSON — no markdown code blocks, no commentary, no text before or after the JSON.
2. Never invent awards, certifications, testimonials, or past clients. Use [PLACEHOLDER] if uncertain.
3. Always maintain a professional, confident tone.
4. All monetary values must be numbers (not strings).
5. The pricing_total must equal the sum of all pricing[].total values.
6. All arrays must have at least one item.
7. The generated_at field must be an ISO 8601 timestamp.

OUTPUT SCHEMA:
{
  "title": "string",
  "client": { "name": "string", "industry": "string", "contact_name": "string|undefined" },
  "agency": { "name": "string", "tagline": "string|undefined" },
  "executive_summary": "string (2-3 paragraphs)",
  "problem_statement": "string (1-2 paragraphs)",
  "proposed_solution": "string (2-3 paragraphs)",
  "deliverables": [{ "title": "string", "description": "string", "included": true }],
  "timeline": [{ "phase": "string", "duration": "string", "milestones": ["string"] }],
  "pricing": [{ "item": "string", "qty": number, "unit_price": number, "total": number }],
  "pricing_total": number,
  "assumptions": ["string"],
  "next_steps": ["string"],
  "generated_at": "ISO 8601 string"
}`

export function buildOneShotUserPrompt(data: OneShotFormData, brandKit?: Partial<BrandKit>): string {
  const agencyName = data.agency_name || brandKit?.agency_name || '[AGENCY NAME]'
  const tone = brandKit?.tone_of_voice || 'professional'

  return `Generate a complete proposal with the following details:

CLIENT:
- Name: ${data.client_name}
- Industry: ${data.client_industry}

PROJECT:
- Description: ${data.project_description}
- Budget: ${data.budget}
- Timeline: ${data.timeline}

AGENCY:
- Name: ${agencyName}

TONE: ${tone}

Generate a thorough, professional proposal. Today's date is ${new Date().toISOString()}.`
}

export function buildWizardUserPrompt(data: WizardFormData, brandKit?: Partial<BrandKit>): string {
  const agencyName = data.agency_name || brandKit?.agency_name || '[AGENCY NAME]'
  const tone = data.tone_of_voice || brandKit?.tone_of_voice || 'professional'

  return `Generate a complete proposal with the following details:

CLIENT:
- Name: ${data.client_name}
- Industry: ${data.client_industry}
- Contact Name: ${data.client_contact_name || 'Not specified'}

PROJECT:
- Title: ${data.project_title}
- Description: ${data.project_description}
- Problem Being Solved: ${data.problem_statement}

DELIVERABLES:
${data.deliverables}

BUDGET: ${data.budget}
TIMELINE: ${data.timeline}
PAYMENT TERMS: ${data.payment_terms || 'Standard net-30'}

AGENCY:
- Name: ${agencyName}
- Tagline: ${data.agency_tagline || 'Not specified'}

TONE: ${tone}

Generate a thorough, professional proposal matching all the above details exactly. Today's date is ${new Date().toISOString()}.`
}
