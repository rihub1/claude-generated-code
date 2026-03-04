import { Hero } from '@/components/marketing/Hero'
import { HowItWorks } from '@/components/marketing/HowItWorks'
import { ProposalPreviewDemo } from '@/components/marketing/ProposalPreviewDemo'
import { Testimonials } from '@/components/marketing/Testimonials'
import { FAQ } from '@/components/marketing/FAQ'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function HomePage() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <ProposalPreviewDemo />
      <Testimonials />
      <FAQ />

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-600 to-indigo-700 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
          Ready to win more clients?
        </h2>
        <p className="text-blue-100 text-lg mb-8 max-w-xl mx-auto">
          Join thousands of agencies that generate winning proposals in under 60 seconds.
        </p>
        <Link
          href="/auth/signup"
          className="inline-flex items-center gap-2 bg-white text-blue-600 font-semibold px-8 py-3 rounded-xl hover:bg-blue-50 transition-colors"
        >
          Get started free
          <ArrowRight className="w-4 h-4" />
        </Link>
        <p className="mt-4 text-blue-200 text-sm">No credit card required</p>
      </section>
    </>
  )
}
