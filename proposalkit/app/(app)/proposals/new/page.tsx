'use client'

import { useState } from 'react'
import { OneShotForm } from '@/components/proposals/OneShotForm'
import { WizardForm } from '@/components/proposals/WizardForm'
import { PageHeader } from '@/components/shared/PageHeader'
import { cn } from '@/lib/utils'

type Mode = 'oneshot' | 'wizard'

export default function NewProposalPage() {
  const [mode, setMode] = useState<Mode>('oneshot')

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader
        title="New Proposal"
        description="Fill in the details and let AI write your proposal."
      />

      {/* Tab toggle */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-xl mb-8 w-fit">
        <button
          onClick={() => setMode('oneshot')}
          className={cn(
            'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
            mode === 'oneshot'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          )}
        >
          One-shot
        </button>
        <button
          onClick={() => setMode('wizard')}
          className={cn(
            'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
            mode === 'wizard'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          )}
        >
          Step-by-step wizard
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        {mode === 'oneshot' ? (
          <div>
            <p className="text-sm text-gray-500 mb-6">
              Quick generation — fill in the essentials and get a full proposal in seconds.
            </p>
            <OneShotForm />
          </div>
        ) : (
          <div>
            <p className="text-sm text-gray-500 mb-6">
              Guided 5-step process for more detailed, customized proposals.
            </p>
            <WizardForm />
          </div>
        )}
      </div>
    </div>
  )
}
