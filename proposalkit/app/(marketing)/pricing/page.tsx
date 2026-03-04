import type { Metadata } from 'next'
import Link from 'next/link'
import { Check } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Pricing',
  description: 'Simple, transparent pricing for ProposalKit.',
}

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Try it out — no credit card needed',
    features: [
      '3 proposals (lifetime)',
      'PDF & DOCX export',
      'All built-in templates',
      'Email support',
    ],
    cta: 'Get started free',
    href: '/auth/signup',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '$39',
    period: 'per month',
    description: 'For freelancers and growing agencies',
    features: [
      'Unlimited proposals',
      'Custom brand kit',
      'Custom templates',
      'PDF & DOCX export',
      'Remove ProposalKit branding',
      'Priority support',
    ],
    cta: 'Get started',
    href: '/auth/signup',
    highlight: true,
  },
  {
    name: 'Agency',
    price: '$89',
    period: 'per month',
    description: 'For teams that send proposals at scale',
    features: [
      'Everything in Pro',
      'Up to 10 team members',
      'Shared template library',
      'Usage analytics',
      'Dedicated onboarding',
    ],
    cta: 'Contact us',
    href: '/contact',
    highlight: false,
  },
]

export default function PricingPage() {
  return (
    <div>
      <div className="bg-gradient-to-b from-blue-50 to-white py-16 px-4 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Simple pricing</h1>
        <p className="text-gray-500 text-lg max-w-xl mx-auto">
          Start free. Upgrade when you need more.
        </p>
      </div>

      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl border p-8 flex flex-col ${
                plan.highlight
                  ? 'border-blue-500 shadow-lg shadow-blue-100 bg-blue-600 text-white'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <div className="mb-6">
                <p className={`text-sm font-semibold mb-1 ${plan.highlight ? 'text-blue-200' : 'text-gray-500'}`}>
                  {plan.name}
                </p>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className={`text-4xl font-extrabold ${plan.highlight ? 'text-white' : 'text-gray-900'}`}>
                    {plan.price}
                  </span>
                  <span className={`text-sm ${plan.highlight ? 'text-blue-200' : 'text-gray-400'}`}>
                    /{plan.period}
                  </span>
                </div>
                <p className={`text-sm ${plan.highlight ? 'text-blue-100' : 'text-gray-500'}`}>
                  {plan.description}
                </p>
              </div>

              <ul className="space-y-3 flex-1 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm">
                    <Check className={`w-4 h-4 flex-shrink-0 ${plan.highlight ? 'text-blue-200' : 'text-blue-600'}`} />
                    <span className={plan.highlight ? 'text-blue-50' : 'text-gray-700'}>{f}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className={`text-center font-semibold py-2.5 px-4 rounded-xl transition-colors text-sm ${
                  plan.highlight
                    ? 'bg-white text-blue-600 hover:bg-blue-50'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
