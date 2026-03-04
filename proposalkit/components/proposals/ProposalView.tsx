import type { ProposalJSON } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils'

interface ProposalViewProps {
  proposal: ProposalJSON
}

export function ProposalView({ proposal }: ProposalViewProps) {
  return (
    <div className="proposal-content bg-white max-w-4xl mx-auto" id="proposal-print-area">
      {/* Header */}
      <div className="border-b-4 border-blue-600 pb-8 mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{proposal.title}</h1>
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-500">
          <span>
            Prepared for: <strong className="text-gray-700">{proposal.client.name}</strong>
            {proposal.client.contact_name && ` (${proposal.client.contact_name})`}
          </span>
          <span>
            Prepared by: <strong className="text-gray-700">{proposal.agency.name}</strong>
            {proposal.agency.tagline && ` · ${proposal.agency.tagline}`}
          </span>
          <span>{formatDate(proposal.generated_at)}</span>
        </div>
      </div>

      {/* Executive Summary */}
      <section className="mb-8">
        <SectionHeading>Executive Summary</SectionHeading>
        <p className="text-gray-700 leading-relaxed whitespace-pre-line">{proposal.executive_summary}</p>
      </section>

      {/* Problem Statement */}
      <section className="mb-8">
        <SectionHeading>Problem Statement</SectionHeading>
        <p className="text-gray-700 leading-relaxed whitespace-pre-line">{proposal.problem_statement}</p>
      </section>

      {/* Proposed Solution */}
      <section className="mb-8">
        <SectionHeading>Proposed Solution</SectionHeading>
        <p className="text-gray-700 leading-relaxed whitespace-pre-line">{proposal.proposed_solution}</p>
      </section>

      {/* Deliverables */}
      <section className="mb-8">
        <SectionHeading>Deliverables</SectionHeading>
        <div className="space-y-3">
          {proposal.deliverables.map((d, i) => (
            <div
              key={i}
              className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-100"
            >
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  d.included ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                {d.included && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{d.title}</p>
                <p className="text-sm text-gray-600 mt-0.5">{d.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Timeline */}
      <section className="mb-8">
        <SectionHeading>Project Timeline</SectionHeading>
        <div className="space-y-4">
          {proposal.timeline.map((phase, i) => (
            <div key={i} className="relative pl-6 border-l-2 border-blue-200">
              <div className="absolute -left-[9px] top-0.5 w-4 h-4 rounded-full bg-blue-600 border-2 border-white" />
              <div className="mb-1 flex items-baseline gap-2">
                <span className="text-sm font-semibold text-gray-900">{phase.phase}</span>
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                  {phase.duration}
                </span>
              </div>
              <ul className="mt-1 space-y-1">
                {phase.milestones.map((m, j) => (
                  <li key={j} className="text-sm text-gray-600 flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-gray-400 flex-shrink-0" />
                    {m}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="mb-8">
        <SectionHeading>Investment</SectionHeading>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-3 font-semibold text-gray-700">Item</th>
                <th className="text-center py-3 font-semibold text-gray-700 w-16">Qty</th>
                <th className="text-right py-3 font-semibold text-gray-700 w-28">Unit Price</th>
                <th className="text-right py-3 font-semibold text-gray-700 w-28">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {proposal.pricing.map((item, i) => (
                <tr key={i}>
                  <td className="py-3 text-gray-700">{item.item}</td>
                  <td className="py-3 text-center text-gray-500">{item.qty}</td>
                  <td className="py-3 text-right text-gray-600">{formatCurrency(item.unit_price)}</td>
                  <td className="py-3 text-right text-gray-700">{formatCurrency(item.total)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-gray-900">
                <td colSpan={3} className="py-4 font-bold text-gray-900 text-right pr-4">
                  Total Investment
                </td>
                <td className="py-4 font-bold text-blue-600 text-right text-lg">
                  {formatCurrency(proposal.pricing_total)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      {/* Assumptions */}
      {proposal.assumptions.length > 0 && (
        <section className="mb-8">
          <SectionHeading>Assumptions</SectionHeading>
          <ul className="space-y-2">
            {proposal.assumptions.map((a, i) => (
              <li key={i} className="text-sm text-gray-700 flex gap-2">
                <span className="text-gray-400 flex-shrink-0">•</span>
                {a}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Next Steps */}
      {proposal.next_steps.length > 0 && (
        <section className="mb-8">
          <SectionHeading>Next Steps</SectionHeading>
          <ol className="space-y-2">
            {proposal.next_steps.map((step, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  )
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-4 flex items-center gap-2">
      <span className="flex-1 h-px bg-blue-100" />
      {children}
      <span className="flex-1 h-px bg-blue-100" />
    </h2>
  )
}
