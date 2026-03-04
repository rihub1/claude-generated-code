import Link from 'next/link'
import { FilePlus, FileText } from 'lucide-react'

export function EmptyState() {
  return (
    <div className="text-center py-16 px-4">
      <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <FileText className="w-8 h-8 text-blue-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">No proposals yet</h3>
      <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
        Create your first AI-generated proposal in under 60 seconds.
      </p>
      <Link
        href="/proposals/new"
        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-xl transition-colors text-sm"
      >
        <FilePlus className="w-4 h-4" />
        Create proposal
      </Link>
    </div>
  )
}
