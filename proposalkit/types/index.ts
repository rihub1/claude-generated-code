export type ProposalStatus = 'draft' | 'generated' | 'sent'

export interface ProposalDeliverable {
  title: string
  description: string
  included: boolean
}

export interface ProposalTimelinePhase {
  phase: string
  duration: string
  milestones: string[]
}

export interface ProposalPricingItem {
  item: string
  qty: number
  unit_price: number
  total: number
}

export interface ProposalClient {
  name: string
  industry: string
  contact_name?: string
}

export interface ProposalAgency {
  name: string
  tagline?: string
}

export interface ProposalJSON {
  title: string
  client: ProposalClient
  agency: ProposalAgency
  executive_summary: string
  problem_statement: string
  proposed_solution: string
  deliverables: ProposalDeliverable[]
  timeline: ProposalTimelinePhase[]
  pricing: ProposalPricingItem[]
  pricing_total: number
  assumptions: string[]
  next_steps: string[]
  generated_at: string
}

export interface Proposal {
  id: string
  user_id: string
  title: string
  client_name: string
  status: ProposalStatus
  proposal_json: ProposalJSON | null
  rendered_html: string | null
  created_at: string
  updated_at: string
}

export interface BrandKit {
  id: string
  user_id: string
  agency_name: string
  logo_url: string | null
  primary_color: string
  tone_of_voice: string
  created_at: string
  updated_at: string
}

export interface Template {
  id: string
  user_id: string | null
  name: string
  description: string
  category: string
  proposal_json: ProposalJSON
  is_builtin: boolean
  created_at: string
}

export interface OneShotFormData {
  client_name: string
  client_industry: string
  project_description: string
  budget: string
  timeline: string
  agency_name?: string
}

export interface WizardFormData {
  // Step 1: Client Info
  client_name: string
  client_industry: string
  client_contact_name?: string
  // Step 2: Project
  project_title: string
  project_description: string
  problem_statement: string
  // Step 3: Deliverables
  deliverables: string
  // Step 4: Pricing & Timeline
  budget: string
  timeline: string
  payment_terms?: string
  // Step 5: Brand
  agency_name?: string
  agency_tagline?: string
  tone_of_voice?: string
}
