'use client'

import { useState } from 'react'
import { Download, FileText, Copy, Loader2, Printer } from 'lucide-react'
import type { ProposalJSON } from '@/types'

interface ExportButtonsProps {
  proposalId: string
  proposalJson: ProposalJSON
  renderedHtml: string
}

export function ExportButtons({ proposalId, proposalJson, renderedHtml }: ExportButtonsProps) {
  const [pdfLoading, setPdfLoading] = useState(false)
  const [docxLoading, setDocxLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  async function downloadPdf() {
    setPdfLoading(true)
    try {
      const res = await fetch('/api/export/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ html: renderedHtml }),
      })

      if (!res.ok) {
        // Fallback to browser print
        window.print()
        return
      }

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${proposalJson.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      window.print()
    } finally {
      setPdfLoading(false)
    }
  }

  async function downloadDocx() {
    setDocxLoading(true)
    try {
      const res = await fetch('/api/export/docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proposal: proposalJson }),
      })

      if (!res.ok) throw new Error('DOCX export failed')

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${proposalJson.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.docx`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      alert('DOCX export failed. Please try again.')
    } finally {
      setDocxLoading(false)
    }
  }

  async function copyEmailVersion() {
    const text = buildEmailText(proposalJson)
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        onClick={downloadPdf}
        disabled={pdfLoading}
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-60"
      >
        {pdfLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
        Export PDF
      </button>

      <button
        onClick={downloadDocx}
        disabled={docxLoading}
        className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-60"
      >
        {docxLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
        Export DOCX
      </button>

      <button
        onClick={() => window.print()}
        className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
      >
        <Printer className="w-4 h-4" />
        Print
      </button>

      <button
        onClick={copyEmailVersion}
        className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
      >
        <Copy className="w-4 h-4" />
        {copied ? 'Copied!' : 'Copy email'}
      </button>
    </div>
  )
}

function buildEmailText(proposal: ProposalJSON): string {
  return `${proposal.title}

Prepared for: ${proposal.client.name}
Prepared by: ${proposal.agency.name}

---

EXECUTIVE SUMMARY
${proposal.executive_summary}

---

PROPOSED SOLUTION
${proposal.proposed_solution}

---

DELIVERABLES
${proposal.deliverables.map((d) => `• ${d.title}: ${d.description}`).join('\n')}

---

TIMELINE
${proposal.timeline.map((p) => `${p.phase} (${p.duration})\n${p.milestones.map((m) => `  - ${m}`).join('\n')}`).join('\n\n')}

---

INVESTMENT
${proposal.pricing.map((p) => `${p.item}: $${p.total.toLocaleString()}`).join('\n')}
Total: $${proposal.pricing_total.toLocaleString()}

---

NEXT STEPS
${proposal.next_steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}
`
}
