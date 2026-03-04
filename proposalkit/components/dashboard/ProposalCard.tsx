import Link from 'next/link'
import { FileText, Clock, CheckCircle, Send } from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'
import type { Proposal } from '@/types'

const statusConfig = {
  draft: { label: 'Draft', icon: Clock, color: 'text-yellow-600 bg-yellow-50 border-yellow-200' },
  generated: { label: 'Generated', icon: CheckCircle, color: 'text-blue-600 bg-blue-50 border-blue-200' },
  sent: { label: 'Sent', icon: Send, color: 'text-green-600 bg-green-50 border-green-200' },
}

export function ProposalCard({ proposal }: { proposal: Proposal }) {
  const config = statusConfig[proposal.status] || statusConfig.draft
  const Icon = config.icon

  return (
    <Link
      href={`/proposals/${proposal.id}`}
      className="group block bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-sm transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
          <FileText className="w-4 h-4 text-blue-600" />
        </div>
        <span
          className={cn(
            'inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border',
            config.color
          )}
        >
          <Icon className="w-3 h-3" />
          {config.label}
        </span>
      </div>
      <h3 className="text-sm font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors line-clamp-2">
        {proposal.title}
      </h3>
      <p className="text-xs text-gray-500 mb-3">{proposal.client_name}</p>
      <p className="text-xs text-gray-400">{formatDate(proposal.created_at)}</p>
    </Link>
  )
}
