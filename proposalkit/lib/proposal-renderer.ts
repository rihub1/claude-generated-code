import type { ProposalJSON } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils'

export function renderProposalHtml(proposal: ProposalJSON): string {
  const deliverableRows = proposal.deliverables
    .map(
      (d) => `
    <div class="deliverable">
      <div class="deliverable-icon ${d.included ? 'included' : 'excluded'}">
        ${d.included ? '✓' : '·'}
      </div>
      <div>
        <strong>${escHtml(d.title)}</strong>
        <p>${escHtml(d.description)}</p>
      </div>
    </div>`
    )
    .join('')

  const timelineRows = proposal.timeline
    .map(
      (phase) => `
    <div class="timeline-phase">
      <div class="phase-header">
        <strong>${escHtml(phase.phase)}</strong>
        <span class="badge">${escHtml(phase.duration)}</span>
      </div>
      <ul>
        ${phase.milestones.map((m) => `<li>${escHtml(m)}</li>`).join('')}
      </ul>
    </div>`
    )
    .join('')

  const pricingRows = proposal.pricing
    .map(
      (item) => `
    <tr>
      <td>${escHtml(item.item)}</td>
      <td class="center">${item.qty}</td>
      <td class="right">${formatCurrency(item.unit_price)}</td>
      <td class="right">${formatCurrency(item.total)}</td>
    </tr>`
    )
    .join('')

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escHtml(proposal.title)}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 14px; color: #111; background: white; padding: 40px; max-width: 860px; margin: 0 auto; }
  h1 { font-size: 28px; font-weight: 800; margin-bottom: 8px; }
  h2 { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #2563eb; margin-bottom: 16px; border-bottom: 1px solid #dbeafe; padding-bottom: 4px; }
  .meta { color: #666; font-size: 13px; margin-bottom: 8px; }
  section { margin-bottom: 32px; }
  p { line-height: 1.7; color: #374151; }
  .deliverable { display: flex; gap: 12px; padding: 12px; background: #f9fafb; border-radius: 8px; margin-bottom: 8px; }
  .deliverable-icon { width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: bold; flex-shrink: 0; }
  .included { background: #2563eb; color: white; }
  .excluded { background: #d1d5db; color: white; }
  .timeline-phase { padding-left: 20px; border-left: 3px solid #bfdbfe; margin-bottom: 16px; }
  .phase-header { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
  .badge { font-size: 11px; background: #eff6ff; color: #1d4ed8; padding: 2px 8px; border-radius: 12px; }
  ul { padding-left: 16px; }
  li { color: #4b5563; line-height: 1.8; }
  table { width: 100%; border-collapse: collapse; }
  th { text-align: left; padding: 10px; border-bottom: 2px solid #e5e7eb; font-weight: 600; color: #374151; }
  td { padding: 10px; border-bottom: 1px solid #f3f4f6; }
  .center { text-align: center; }
  .right { text-align: right; }
  .total-row td { font-weight: 700; border-top: 2px solid #111; font-size: 16px; }
  .total-amount { color: #2563eb; }
  .header-block { border-bottom: 4px solid #2563eb; padding-bottom: 20px; margin-bottom: 28px; }
  @media print {
    body { padding: 0; }
    .no-print { display: none !important; }
  }
</style>
</head>
<body>
<div class="header-block">
  <h1>${escHtml(proposal.title)}</h1>
  <p class="meta">Prepared for: <strong>${escHtml(proposal.client.name)}</strong>${proposal.client.contact_name ? ` (${escHtml(proposal.client.contact_name)})` : ''}</p>
  <p class="meta">Prepared by: <strong>${escHtml(proposal.agency.name)}</strong>${proposal.agency.tagline ? ` · ${escHtml(proposal.agency.tagline)}` : ''}</p>
  <p class="meta">${formatDate(proposal.generated_at)}</p>
</div>

<section>
  <h2>Executive Summary</h2>
  <p>${escHtml(proposal.executive_summary).replace(/\n/g, '<br>')}</p>
</section>

<section>
  <h2>Problem Statement</h2>
  <p>${escHtml(proposal.problem_statement).replace(/\n/g, '<br>')}</p>
</section>

<section>
  <h2>Proposed Solution</h2>
  <p>${escHtml(proposal.proposed_solution).replace(/\n/g, '<br>')}</p>
</section>

<section>
  <h2>Deliverables</h2>
  ${deliverableRows}
</section>

<section>
  <h2>Project Timeline</h2>
  ${timelineRows}
</section>

<section>
  <h2>Investment</h2>
  <table>
    <thead>
      <tr>
        <th>Item</th>
        <th class="center">Qty</th>
        <th class="right">Unit Price</th>
        <th class="right">Total</th>
      </tr>
    </thead>
    <tbody>
      ${pricingRows}
    </tbody>
    <tfoot>
      <tr class="total-row">
        <td colspan="3" class="right">Total Investment</td>
        <td class="right total-amount">${formatCurrency(proposal.pricing_total)}</td>
      </tr>
    </tfoot>
  </table>
</section>

${proposal.assumptions.length > 0 ? `
<section>
  <h2>Assumptions</h2>
  <ul>
    ${proposal.assumptions.map((a) => `<li>${escHtml(a)}</li>`).join('')}
  </ul>
</section>
` : ''}

${proposal.next_steps.length > 0 ? `
<section>
  <h2>Next Steps</h2>
  <ol>
    ${proposal.next_steps.map((s) => `<li>${escHtml(s)}</li>`).join('')}
  </ol>
</section>
` : ''}

</body>
</html>`
}

function escHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
