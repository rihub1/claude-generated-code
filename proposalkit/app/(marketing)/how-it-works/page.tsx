import type { Metadata } from 'next'
import { HowItWorks } from '@/components/marketing/HowItWorks'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'How It Works',
  description: 'Learn how ProposalKit helps you generate winning proposals in under 60 seconds.',
}

export default function HowItWorksPage() {
  return (
    <div>
      <div className="bg-gradient-to-b from-blue-50 to-white py-16 px-4 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">How ProposalKit Works</h1>
        <p className="text-gray-500 text-lg max-w-xl mx-auto">
          From blank page to polished proposal in three simple steps.
        </p>
      </div>
      <HowItWorks />
      <section className="py-16 px-4 bg-gray-50 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to try it?</h2>
        <Link
          href="/auth/signup"
          className="inline-flex items-center gap-2 bg-blue-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors"
        >
          Generate your first proposal free
          <ArrowRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  )
}
