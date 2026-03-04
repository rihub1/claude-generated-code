import { NextRequest, NextResponse } from 'next/server'
import { generateDocx } from '@/lib/docx/generator'
import { ProposalJSONSchema } from '@/lib/llm/schema'
import type { ProposalJSON } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { proposal } = body

    if (!proposal) {
      return NextResponse.json({ error: 'proposal is required' }, { status: 400 })
    }

    // Validate
    const validated = ProposalJSONSchema.parse(proposal)

    const buffer = await generateDocx(validated as unknown as ProposalJSON)

    const filename = `${validated.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.docx`

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (err) {
    console.error('DOCX export error:', err)
    return NextResponse.json({ error: 'DOCX generation failed' }, { status: 500 })
  }
}
