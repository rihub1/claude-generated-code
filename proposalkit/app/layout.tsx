import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'ProposalKit — Generate Polished Proposals in 60 Seconds',
    template: '%s | ProposalKit',
  },
  description:
    'ProposalKit helps agencies generate polished, professional proposals in under 60 seconds using AI. Win more clients with less effort.',
  keywords: ['proposal generator', 'agency proposal', 'AI proposal', 'business proposal'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: 'ProposalKit',
    title: 'ProposalKit — Generate Polished Proposals in 60 Seconds',
    description: 'Generate polished, professional proposals in under 60 seconds using AI.',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
