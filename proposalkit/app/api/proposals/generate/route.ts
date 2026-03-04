import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getLLMClient, getModel } from '@/lib/llm/client'
import { SYSTEM_PROMPT, buildOneShotUserPrompt, buildWizardUserPrompt } from '@/lib/llm/prompts'
import { ProposalJSONSchema } from '@/lib/llm/schema'
import { renderProposalHtml } from '@/lib/proposal-renderer'
import type { OneShotFormData, WizardFormData, BrandKit } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { mode, ...formData } = body

    if (!mode || !['oneshot', 'wizard'].includes(mode)) {
      return NextResponse.json({ error: 'Invalid mode' }, { status: 400 })
    }

    // Fetch user's brand kit for defaults
    const { data: brandKit } = await supabase
      .from('brand_kits')
      .select('*')
      .eq('user_id', user.id)
      .single()

    // Build prompt
    const userPrompt =
      mode === 'oneshot'
        ? buildOneShotUserPrompt(formData as OneShotFormData, brandKit as Partial<BrandKit> | undefined)
        : buildWizardUserPrompt(formData as WizardFormData, brandKit as Partial<BrandKit> | undefined)

    // Call LLM
    const llm = getLLMClient()
    const model = getModel()

    const completion = await llm.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 4096,
    })

    const rawContent = completion.choices[0]?.message?.content || ''

    // Parse and validate JSON
    let proposalJson
    try {
      // Strip any accidental markdown code fences
      const jsonStr = rawContent.replace(/^```json?\s*/i, '').replace(/\s*```$/i, '').trim()
      const parsed = JSON.parse(jsonStr)
      proposalJson = ProposalJSONSchema.parse(parsed)
    } catch (parseErr) {
      console.error('LLM output parse error:', parseErr, '\nRaw:', rawContent.slice(0, 500))
      return NextResponse.json(
        { error: 'AI returned invalid JSON. Please try again.' },
        { status: 422 }
      )
    }

    // Render HTML
    const renderedHtml = renderProposalHtml(proposalJson)

    // Save to Supabase
    const { data: saved, error: saveError } = await supabase
      .from('proposals')
      .insert({
        user_id: user.id,
        title: proposalJson.title,
        client_name: proposalJson.client.name,
        status: 'generated',
        proposal_json: proposalJson as unknown as Record<string, unknown>,
        rendered_html: renderedHtml,
      })
      .select('id')
      .single()

    if (saveError || !saved) {
      console.error('Supabase save error:', saveError)
      return NextResponse.json({ error: 'Failed to save proposal' }, { status: 500 })
    }

    return NextResponse.json({ id: saved.id, proposal: proposalJson })
  } catch (err) {
    console.error('Generate route error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
