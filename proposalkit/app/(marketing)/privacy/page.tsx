import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy',
}

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
      <p className="text-gray-400 text-sm mb-10">Last updated: January 2025</p>

      <div className="prose prose-gray max-w-none space-y-8 text-sm text-gray-700 leading-relaxed">
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">1. Information We Collect</h2>
          <p>
            We collect information you provide directly, including account registration details (email address, agency name), proposal content you enter, and brand kit settings. We also collect usage data such as pages visited and features used.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">2. How We Use Your Information</h2>
          <p>
            We use your information to provide and improve ProposalKit, send transactional emails (account confirmations, password resets), respond to support requests, and analyze usage patterns to improve the product.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">3. Data Storage and Security</h2>
          <p>
            Your data is stored securely using Supabase (Postgres with encryption at rest) hosted on AWS. We use HTTPS for all data in transit. Proposal content is only accessible to you.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">4. AI and Your Data</h2>
          <p>
            Proposal content you enter is sent to an AI provider (OpenAI or equivalent) to generate proposals. We do not use your proposal content to train AI models. Your data is processed according to our AI provider's data processing agreement.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">5. Data Retention</h2>
          <p>
            We retain your data as long as your account is active. You may delete your account and all associated data at any time from your account settings.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">6. Contact</h2>
          <p>
            Questions about this policy? Contact us at privacy@proposalkit.com.
          </p>
        </section>
      </div>
    </div>
  )
}
