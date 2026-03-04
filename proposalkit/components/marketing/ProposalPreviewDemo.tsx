export function ProposalPreviewDemo() {
  return (
    <section className="py-20 px-4 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            What a ProposalKit proposal looks like
          </h2>
          <p className="text-gray-500">
            Clean, structured, and ready to impress.
          </p>
        </div>

        {/* Mock proposal preview */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center gap-2 px-4 py-3 bg-gray-100 border-b border-gray-200">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
            <div className="flex-1 mx-4 bg-white rounded px-3 py-1 text-xs text-gray-400">
              ProposalKit — Website Redesign & Development Proposal
            </div>
          </div>

          {/* Proposal content */}
          <div className="p-8 md:p-12 max-h-96 overflow-hidden relative">
            <div className="max-w-2xl">
              <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">Proposal</p>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                Website Redesign & Development
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                Prepared for Bright Solar Co. &nbsp;·&nbsp; Prepared by Acme Digital Agency
              </p>

              <div className="space-y-5">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-2">
                    Executive Summary
                  </h3>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    We propose a comprehensive website redesign that will modernize Bright Solar Co.'s online presence, improve user experience, and drive measurable business results. Our team will deliver a fast, mobile-first website built on modern technology that reflects your brand and converts visitors into customers.
                  </p>
                </div>

                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-2">
                    Deliverables
                  </h3>
                  <div className="space-y-2">
                    {[
                      'Discovery & Strategy',
                      'UX/UI Design (10 pages)',
                      'Responsive Development',
                      'SEO Foundation',
                      'Launch & Training',
                    ].map((item) => (
                      <div key={item} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-600 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between py-3 border-t border-b border-gray-100">
                  <span className="text-sm font-semibold text-gray-900">Total Investment</span>
                  <span className="text-lg font-bold text-blue-600">$13,000</span>
                </div>
              </div>
            </div>

            {/* Fade overlay */}
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white to-transparent" />
          </div>
        </div>
      </div>
    </section>
  )
}
