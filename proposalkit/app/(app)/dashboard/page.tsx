import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/shared/PageHeader'
import { ProposalCard } from '@/components/dashboard/ProposalCard'
import { EmptyState } from '@/components/dashboard/EmptyState'
import Link from 'next/link'
import { FilePlus } from 'lucide-react'
import type { Proposal } from '@/types'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: proposals } = await supabase
    .from('proposals')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20)

  const total = proposals?.length ?? 0
  const generated = proposals?.filter((p) => p.status !== 'draft').length ?? 0

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Your recent proposals and activity"
        actions={
          <Link
            href="/proposals/new"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors"
          >
            <FilePlus className="w-4 h-4" />
            New proposal
          </Link>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-2xl font-bold text-gray-900">{total}</p>
          <p className="text-sm text-gray-500">Total proposals</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-2xl font-bold text-gray-900">{generated}</p>
          <p className="text-sm text-gray-500">Generated</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-2xl font-bold text-gray-900">
            {proposals?.filter((p) => p.status === 'sent').length ?? 0}
          </p>
          <p className="text-sm text-gray-500">Sent to clients</p>
        </div>
      </div>

      {/* Proposals grid */}
      {!proposals || proposals.length === 0 ? (
        <EmptyState />
      ) : (
        <div>
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Recent proposals</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {proposals.map((proposal) => (
              <ProposalCard key={proposal.id} proposal={proposal as unknown as Proposal} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
