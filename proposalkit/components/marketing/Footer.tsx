import Link from 'next/link'
import { FileText } from 'lucide-react'

const links = {
  Product: [
    { href: '/how-it-works', label: 'How it works' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/proposal-templates', label: 'Templates' },
  ],
  Company: [
    { href: '/contact', label: 'Contact' },
  ],
  Legal: [
    { href: '/privacy', label: 'Privacy Policy' },
    { href: '/terms', label: 'Terms of Service' },
  ],
}

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 bg-blue-600 rounded-md flex items-center justify-center">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-white">ProposalKit</span>
            </div>
            <p className="text-sm">
              Generate polished proposals in under 60 seconds. Win more clients with less effort.
            </p>
          </div>

          {Object.entries(links).map(([section, items]) => (
            <div key={section}>
              <h4 className="text-white font-medium text-sm mb-4">{section}</h4>
              <ul className="space-y-2">
                {items.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="text-sm hover:text-white transition-colors">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-8 border-t border-gray-800 text-sm text-center">
          &copy; {new Date().getFullYear()} ProposalKit. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
