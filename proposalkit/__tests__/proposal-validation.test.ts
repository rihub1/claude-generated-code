import { ProposalJSONSchema } from '../lib/llm/schema'

const validProposal = {
  title: 'Website Redesign Proposal',
  client: {
    name: 'Acme Corp',
    industry: 'E-commerce',
    contact_name: 'Jane Smith',
  },
  agency: {
    name: 'Digital Agency Inc',
    tagline: 'Building the web',
  },
  executive_summary: 'We propose a comprehensive website redesign.',
  problem_statement: 'The current website is slow and outdated.',
  proposed_solution: 'We will build a modern, fast website using Next.js.',
  deliverables: [
    {
      title: 'UX/UI Design',
      description: 'Full design system',
      included: true,
    },
  ],
  timeline: [
    {
      phase: 'Discovery',
      duration: '2 weeks',
      milestones: ['Kick-off call', 'Requirements signed off'],
    },
  ],
  pricing: [
    {
      item: 'Design & Development',
      qty: 1,
      unit_price: 10000,
      total: 10000,
    },
  ],
  pricing_total: 10000,
  assumptions: ['Client provides assets within 5 days'],
  next_steps: ['Sign proposal', 'Pay deposit'],
  generated_at: new Date().toISOString(),
}

describe('ProposalJSONSchema', () => {
  test('validates a correct proposal', () => {
    const result = ProposalJSONSchema.safeParse(validProposal)
    expect(result.success).toBe(true)
  })

  test('rejects missing title', () => {
    const { title, ...noTitle } = validProposal
    const result = ProposalJSONSchema.safeParse(noTitle)
    expect(result.success).toBe(false)
  })

  test('rejects empty deliverables array', () => {
    const result = ProposalJSONSchema.safeParse({
      ...validProposal,
      deliverables: [],
    })
    expect(result.success).toBe(false)
  })

  test('rejects empty timeline array', () => {
    const result = ProposalJSONSchema.safeParse({
      ...validProposal,
      timeline: [],
    })
    expect(result.success).toBe(false)
  })

  test('rejects empty pricing array', () => {
    const result = ProposalJSONSchema.safeParse({
      ...validProposal,
      pricing: [],
    })
    expect(result.success).toBe(false)
  })

  test('rejects negative pricing total', () => {
    const result = ProposalJSONSchema.safeParse({
      ...validProposal,
      pricing_total: -100,
    })
    expect(result.success).toBe(false)
  })

  test('rejects negative unit price', () => {
    const result = ProposalJSONSchema.safeParse({
      ...validProposal,
      pricing: [{ item: 'Test', qty: 1, unit_price: -50, total: -50 }],
    })
    expect(result.success).toBe(false)
  })

  test('allows optional contact_name and tagline', () => {
    const minimal = {
      ...validProposal,
      client: { name: 'Corp', industry: 'Tech' },
      agency: { name: 'Agency' },
    }
    const result = ProposalJSONSchema.safeParse(minimal)
    expect(result.success).toBe(true)
  })

  test('pricing_total of zero is valid', () => {
    const result = ProposalJSONSchema.safeParse({
      ...validProposal,
      pricing: [{ item: 'Free item', qty: 1, unit_price: 0, total: 0 }],
      pricing_total: 0,
    })
    expect(result.success).toBe(true)
  })
})
