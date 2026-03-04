import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Templates',
  description: 'Browse ProposalKit\'s built-in proposal templates for agencies.',
}

const templates = [
  {
    name: 'Web Design & Development',
    category: 'Web',
    description: 'Full website redesign and development for small-to-medium businesses.',
    color: 'bg-blue-100 text-blue-700',
  },
  {
    name: 'SEO & Content Marketing',
    category: 'Marketing',
    description: 'Ongoing SEO retainer and content strategy for growing organic traffic.',
    color: 'bg-green-100 text-green-700',
  },
  {
    name: 'Brand Identity Design',
    category: 'Branding',
    description: 'Logo design and complete brand identity system.',
    color: 'bg-purple-100 text-purple-700',
  },
  {
    name: 'Social Media Management',
    category: 'Social',
    description: 'Monthly social media management and content creation retainer.',
    color: 'bg-pink-100 text-pink-700',
  },
  {
    name: 'Custom Software Development',
    category: 'Software',
    description: 'Custom web application or MVP development for startups.',
    color: 'bg-orange-100 text-orange-700',
  },
]

export default function TemplatesPage() {
  return (
    <div>
      <div className="bg-gradient-to-b from-blue-50 to-white py-16 px-4 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Proposal Templates</h1>
        <p className="text-gray-500 text-lg max-w-xl mx-auto">
          5 built-in templates covering the most common agency services. Use as-is or let AI customize them.
        </p>
      </div>

      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((tpl) => (
            <div key={tpl.name} className="bg-white border border-gray-200 rounded-2xl p-6">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${tpl.color} inline-block mb-4`}>
                {tpl.category}
              </span>
              <h3 className="text-base font-bold text-gray-900 mb-2">{tpl.name}</h3>
              <p className="text-sm text-gray-500 mb-5">{tpl.description}</p>
              <Link
                href="/auth/signup"
                className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline"
              >
                Use this template <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
