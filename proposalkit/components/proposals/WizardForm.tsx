'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { Loader2, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react'
import type { WizardFormData } from '@/types'
import { cn } from '@/lib/utils'

const STEPS = [
  { title: 'Client Info', fields: ['client_name', 'client_industry', 'client_contact_name'] },
  { title: 'Project Details', fields: ['project_title', 'project_description', 'problem_statement'] },
  { title: 'Deliverables', fields: ['deliverables'] },
  { title: 'Pricing & Timeline', fields: ['budget', 'timeline', 'payment_terms'] },
  { title: 'Your Brand', fields: ['agency_name', 'agency_tagline', 'tone_of_voice'] },
]

export function WizardForm() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm<WizardFormData>()

  async function goNext() {
    const stepFields = STEPS[step].fields as (keyof WizardFormData)[]
    const valid = await trigger(stepFields)
    if (valid) setStep((s) => Math.min(s + 1, STEPS.length - 1))
  }

  async function onSubmit(data: WizardFormData) {
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/proposals/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'wizard', ...data }),
      })

      if (!res.ok) {
        const body = await res.json()
        throw new Error(body.error || 'Generation failed')
      }

      const { id } = await res.json()
      router.push(`/proposals/${id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setLoading(false)
    }
  }

  const isLastStep = step === STEPS.length - 1

  return (
    <div>
      {/* Progress */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((s, i) => (
          <div key={i} className="flex items-center gap-2 flex-1">
            <div
              className={cn(
                'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0',
                i < step
                  ? 'bg-blue-600 text-white'
                  : i === step
                  ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                  : 'bg-gray-200 text-gray-400'
              )}
            >
              {i + 1}
            </div>
            <span className={cn('text-xs font-medium hidden sm:block', i === step ? 'text-blue-700' : 'text-gray-400')}>
              {s.title}
            </span>
            {i < STEPS.length - 1 && (
              <div className={cn('flex-1 h-0.5 mx-1', i < step ? 'bg-blue-600' : 'bg-gray-200')} />
            )}
          </div>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Step 1: Client Info */}
        {step === 0 && (
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-gray-900">Tell us about the client</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Client name <span className="text-red-500">*</span>
              </label>
              <input
                {...register('client_name', { required: 'Required' })}
                placeholder="Acme Corp"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.client_name && <p className="text-xs text-red-600 mt-1">{errors.client_name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Industry <span className="text-red-500">*</span>
              </label>
              <input
                {...register('client_industry', { required: 'Required' })}
                placeholder="e.g. E-commerce, SaaS, Healthcare"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.client_industry && <p className="text-xs text-red-600 mt-1">{errors.client_industry.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact name</label>
              <input
                {...register('client_contact_name')}
                placeholder="Jane Smith (optional)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}

        {/* Step 2: Project Details */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-gray-900">Describe the project</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project title <span className="text-red-500">*</span>
              </label>
              <input
                {...register('project_title', { required: 'Required' })}
                placeholder="Website Redesign & Development"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.project_title && <p className="text-xs text-red-600 mt-1">{errors.project_title.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project description <span className="text-red-500">*</span>
              </label>
              <textarea
                {...register('project_description', { required: 'Required', minLength: { value: 20, message: 'Add more detail' } })}
                rows={4}
                placeholder="What are you building? What are the goals and scope?"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
              {errors.project_description && <p className="text-xs text-red-600 mt-1">{errors.project_description.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Problem being solved <span className="text-red-500">*</span>
              </label>
              <textarea
                {...register('problem_statement', { required: 'Required' })}
                rows={3}
                placeholder="What challenge is the client currently facing?"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
              {errors.problem_statement && <p className="text-xs text-red-600 mt-1">{errors.problem_statement.message}</p>}
            </div>
          </div>
        )}

        {/* Step 3: Deliverables */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-gray-900">List your deliverables</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Deliverables <span className="text-red-500">*</span>
              </label>
              <textarea
                {...register('deliverables', { required: 'Required' })}
                rows={6}
                placeholder={`List each deliverable on its own line, e.g.:\nDiscovery & Strategy\nUX/UI Design (up to 10 pages)\nResponsive development\nSEO foundation\nLaunch & training`}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-mono"
              />
              {errors.deliverables && <p className="text-xs text-red-600 mt-1">{errors.deliverables.message}</p>}
              <p className="text-xs text-gray-400 mt-1">One deliverable per line. The AI will expand each into a full description.</p>
            </div>
          </div>
        )}

        {/* Step 4: Pricing & Timeline */}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-gray-900">Pricing and timeline</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Budget / price range <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('budget', { required: 'Required' })}
                  placeholder="e.g. $10,000–$15,000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.budget && <p className="text-xs text-red-600 mt-1">{errors.budget.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Timeline <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('timeline', { required: 'Required' })}
                  placeholder="e.g. 6 weeks"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.timeline && <p className="text-xs text-red-600 mt-1">{errors.timeline.message}</p>}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment terms</label>
              <input
                {...register('payment_terms')}
                placeholder="e.g. 50% upfront, 50% on delivery"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}

        {/* Step 5: Brand */}
        {step === 4 && (
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-gray-900">Your brand</h3>
            <p className="text-sm text-gray-500">These override your Brand Kit for this proposal.</p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Agency name</label>
              <input
                {...register('agency_name')}
                placeholder="Acme Digital Agency"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Agency tagline</label>
              <input
                {...register('agency_tagline')}
                placeholder="Building Digital Experiences"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tone of voice</label>
              <select
                {...register('tone_of_voice')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">Professional (default)</option>
                <option value="professional">Professional</option>
                <option value="friendly">Friendly & approachable</option>
                <option value="bold">Bold & direct</option>
                <option value="formal">Formal</option>
                <option value="creative">Creative & energetic</option>
              </select>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4">
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(s - 1, 0))}
            disabled={step === 0}
            className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>

          {isLastStep ? (
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors disabled:opacity-60 text-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate proposal
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={goNext}
              className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
