'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

const faqs = [
  {
    q: 'How does ProposalKit generate proposals?',
    a: 'ProposalKit uses a large language model (LLM) to generate structured proposals based on the project details you provide. The AI writes every section — executive summary, deliverables, timeline, pricing, and next steps — in a professional tone.',
  },
  {
    q: 'Can I customize the generated proposals?',
    a: 'Yes. Every proposal can be edited before exporting. You can also configure your Brand Kit to have the AI match your agency\'s voice, colors, and name automatically.',
  },
  {
    q: 'What export formats are available?',
    a: 'ProposalKit exports to PDF (via our server-side renderer) and DOCX (compatible with Microsoft Word and Google Docs). You can also copy a formatted email version.',
  },
  {
    q: 'Is my client data safe?',
    a: 'Yes. All data is encrypted at rest and in transit. Each user can only access their own proposals. We do not use your proposal content to train AI models.',
  },
  {
    q: 'Can I use my own AI provider?',
    a: 'ProposalKit supports any OpenAI-compatible API. You can point it at OpenAI, Anthropic (via proxy), or any self-hosted model by setting environment variables.',
  },
  {
    q: 'Is there a free plan?',
    a: 'Yes. You can sign up and generate proposals for free. Paid plans unlock more proposals per month, custom templates, and priority support.',
  },
]

export function FAQ() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section className="py-20 px-4 bg-white" id="faq">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Frequently asked questions
          </h2>
        </div>

        <div className="space-y-2">
          {faqs.map(({ q, a }, i) => (
            <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
              <button
                className="w-full flex items-center justify-between px-5 py-4 text-left"
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span className="text-sm font-semibold text-gray-900">{q}</span>
                <ChevronDown
                  className={cn(
                    'w-4 h-4 text-gray-400 flex-shrink-0 transition-transform',
                    open === i && 'rotate-180'
                  )}
                />
              </button>
              {open === i && (
                <div className="px-5 pb-5">
                  <p className="text-sm text-gray-600 leading-relaxed">{a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
