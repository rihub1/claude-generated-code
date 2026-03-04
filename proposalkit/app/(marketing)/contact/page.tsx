import type { Metadata } from 'next'
import { Mail, MessageSquare } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch with the ProposalKit team.',
}

export default function ContactPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Get in touch</h1>
        <p className="text-gray-500">
          Have a question or need help? We typically respond within one business day.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-6 mb-12">
        <div className="bg-blue-50 rounded-2xl p-6">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
            <Mail className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Email us</h3>
          <p className="text-sm text-gray-500 mb-3">For support and general questions.</p>
          <a href="mailto:hello@proposalkit.com" className="text-blue-600 font-medium text-sm hover:underline">
            hello@proposalkit.com
          </a>
        </div>
        <div className="bg-purple-50 rounded-2xl p-6">
          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
            <MessageSquare className="w-5 h-5 text-purple-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Sales & agency plans</h3>
          <p className="text-sm text-gray-500 mb-3">Interested in our Agency plan?</p>
          <a href="mailto:sales@proposalkit.com" className="text-purple-600 font-medium text-sm hover:underline">
            sales@proposalkit.com
          </a>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-8">
        <h2 className="text-lg font-bold text-gray-900 mb-6">Send a message</h2>
        <form className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                placeholder="Your name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                placeholder="you@agency.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <input
              type="text"
              placeholder="How can we help?"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
            <textarea
              rows={5}
              placeholder="Tell us more..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors text-sm"
          >
            Send message
          </button>
        </form>
      </div>
    </div>
  )
}
