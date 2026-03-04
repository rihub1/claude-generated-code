'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { Loader2, Sparkles } from 'lucide-react'
import type { OneShotFormData } from '@/types'

export function OneShotForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OneShotFormData>()

  async function onSubmit(data: OneShotFormData) {
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/proposals/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'oneshot', ...data }),
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
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
            Client industry <span className="text-red-500">*</span>
          </label>
          <input
            {...register('client_industry', { required: 'Required' })}
            placeholder="e.g. E-commerce, SaaS, Healthcare"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.client_industry && <p className="text-xs text-red-600 mt-1">{errors.client_industry.message}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Project description <span className="text-red-500">*</span>
        </label>
        <textarea
          {...register('project_description', { required: 'Required', minLength: { value: 20, message: 'Please add more detail' } })}
          rows={4}
          placeholder="Describe what you're building for the client — the goals, scope, and context. The more detail, the better the proposal."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
        {errors.project_description && <p className="text-xs text-red-600 mt-1">{errors.project_description.message}</p>}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Budget range <span className="text-red-500">*</span>
          </label>
          <input
            {...register('budget', { required: 'Required' })}
            placeholder="e.g. $10,000–$15,000"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.budget && <p className="text-xs text-red-600 mt-1">{errors.budget.message}</p>}
          <p className="text-xs text-gray-400 mt-1">Enter the client&apos;s budget or your expected project fee. Used to generate realistic pricing in the proposal.</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Timeline <span className="text-red-500">*</span>
          </label>
          <input
            {...register('timeline', { required: 'Required' })}
            placeholder="e.g. 6 weeks, 3 months"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.timeline && <p className="text-xs text-red-600 mt-1">{errors.timeline.message}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Your agency name <span className="text-gray-400 font-normal">(optional — uses Brand Kit if set)</span>
        </label>
        <input
          {...register('agency_name')}
          placeholder="Acme Digital Agency"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-60"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Generating proposal...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            Generate proposal
          </>
        )}
      </button>

      <p className="text-xs text-center text-gray-400">
        Takes about 15–30 seconds. AI will generate a complete, structured proposal.
      </p>
    </form>
  )
}
