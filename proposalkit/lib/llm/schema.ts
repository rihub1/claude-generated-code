import { z } from 'zod'

export const ProposalClientSchema = z.object({
  name: z.string().min(1),
  industry: z.string().min(1),
  contact_name: z.string().optional(),
})

export const ProposalAgencySchema = z.object({
  name: z.string().min(1),
  tagline: z.string().optional(),
})

export const DeliverableSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  included: z.boolean(),
})

export const TimelinePhaseSchema = z.object({
  phase: z.string().min(1),
  duration: z.string().min(1),
  milestones: z.array(z.string()),
})

export const PricingItemSchema = z.object({
  item: z.string().min(1),
  qty: z.number().int().positive(),
  unit_price: z.number().nonnegative(),
  total: z.number().nonnegative(),
})

export const ProposalJSONSchema = z.object({
  title: z.string().min(1),
  client: ProposalClientSchema,
  agency: ProposalAgencySchema,
  executive_summary: z.string().min(1),
  problem_statement: z.string().min(1),
  proposed_solution: z.string().min(1),
  deliverables: z.array(DeliverableSchema).min(1),
  timeline: z.array(TimelinePhaseSchema).min(1),
  pricing: z.array(PricingItemSchema).min(1),
  pricing_total: z.number().nonnegative(),
  assumptions: z.array(z.string()),
  next_steps: z.array(z.string()),
  generated_at: z.string(),
})

export type ValidatedProposalJSON = z.infer<typeof ProposalJSONSchema>
