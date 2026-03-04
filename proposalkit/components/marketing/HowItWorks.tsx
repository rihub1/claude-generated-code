import { ClipboardList, Sparkles, Download } from 'lucide-react'

const steps = [
  {
    icon: ClipboardList,
    step: '01',
    title: 'Describe the project',
    description:
      'Enter your client name, industry, project scope, budget, and timeline. Takes less than 2 minutes.',
    color: 'bg-blue-100 text-blue-600',
  },
  {
    icon: Sparkles,
    step: '02',
    title: 'AI writes your proposal',
    description:
      'Our AI generates a complete, structured proposal with executive summary, deliverables, timeline, and pricing.',
    color: 'bg-purple-100 text-purple-600',
  },
  {
    icon: Download,
    step: '03',
    title: 'Export and send',
    description:
      'Download as PDF or DOCX, or copy a formatted email version. Send directly from ProposalKit.',
    color: 'bg-green-100 text-green-600',
  },
]

export function HowItWorks() {
  return (
    <section className="py-20 px-4 bg-white" id="how-it-works">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            From blank page to polished proposal in 3 steps
          </h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            No templates to fiddle with. No copy-pasting from last month's proposal. Just results.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map(({ icon: Icon, step, title, description, color }) => (
            <div key={step} className="relative">
              <div className="flex flex-col items-start">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                  Step {step}
                </span>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
                <p className="text-gray-500 leading-relaxed">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
