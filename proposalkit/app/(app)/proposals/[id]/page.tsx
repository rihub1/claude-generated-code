import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { PageHeader } from '@/components/shared/PageHeader'
import { ProposalView } from '@/components/proposals/ProposalView'
import { ExportButtons } from '@/components/proposals/ExportButtons'
import Link from 'next/link'
import { ArrowLeft, Edit } from 'lucide-react'
import type { ProposalJSON } from '@/types'

interface Props {
  params: { id: string }
}

export default async function ProposalDetailPage({ params }: Props) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: proposal } = await supabase
    .from('proposals')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (!proposal) notFound()

  const proposalJson = proposal.proposal_json as unknown as ProposalJSON

  if (!proposalJson) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/dashboard" className="text-gray-400 hover:text-gray-600">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-bold text-gray-900">{proposal.title}</h1>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm rounded-lg px-4 py-3">
          This proposal has not been generated yet. It appears to be in draft state.
        </div>
      </div>
    )
  }

  const renderedHtml = proposal.rendered_html || ''

  return (
    <div>
      {/* Back nav + actions */}
      <div className="flex items-center justify-between mb-6 no-print">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to dashboard
        </Link>

        <div className="flex items-center gap-3">
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${
            proposal.status === 'sent'
              ? 'text-green-700 bg-green-50 border-green-200'
              : proposal.status === 'generated'
              ? 'text-blue-700 bg-blue-50 border-blue-200'
              : 'text-yellow-700 bg-yellow-50 border-yellow-200'
          }`}>
            {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
          </span>
        </div>
      </div>

      {/* Export toolbar */}
      <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 mb-6 no-print">
        <ExportButtons
          proposalId={proposal.id}
          proposalJson={proposalJson}
          renderedHtml={renderedHtml}
        />
      </div>

      {/* Proposal content */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-10">
        <ProposalView proposal={proposalJson} />
      </div>
    </div>
  )
}
