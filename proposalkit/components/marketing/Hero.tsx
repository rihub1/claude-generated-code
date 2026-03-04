import Link from 'next/link'
import { ArrowRight, Zap } from 'lucide-react'

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white to-blue-50 pt-16 pb-24 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 text-sm font-medium px-3 py-1 rounded-full mb-6">
          <Zap className="w-3.5 h-3.5" />
          AI-powered proposals — ready in 60 seconds
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
          Win more clients with{' '}
          <span className="text-blue-600">proposals that close</span>
        </h1>

        <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-10">
          ProposalKit uses AI to generate polished, professional proposals tailored to each client — in under 60 seconds. No more staring at blank documents.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/auth/signup"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-base"
          >
            Generate your first proposal free
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/how-it-works"
            className="text-gray-600 hover:text-gray-900 font-medium text-base transition-colors"
          >
            See how it works
          </Link>
        </div>

        <p className="mt-5 text-sm text-gray-400">Free to start. No credit card required.</p>
      </div>
    </section>
  )
}
