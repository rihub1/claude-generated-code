import {
  Document,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  BorderStyle,
  WidthType,
  AlignmentType,
  Packer,
} from 'docx'
import type { ProposalJSON } from '@/types'
import { formatCurrency } from '@/lib/utils'

export async function generateDocx(proposal: ProposalJSON): Promise<Buffer> {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // Title
          new Paragraph({
            text: proposal.title,
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: `Prepared for: ${proposal.client.name}`,
                bold: true,
                size: 24,
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: `Prepared by: ${proposal.agency.name}`,
                size: 22,
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: new Date(proposal.generated_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                }),
                size: 20,
                color: '666666',
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 600 },
          }),

          // Executive Summary
          new Paragraph({
            text: 'Executive Summary',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          }),
          new Paragraph({
            text: proposal.executive_summary,
            spacing: { after: 300 },
          }),

          // Problem Statement
          new Paragraph({
            text: 'Problem Statement',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          }),
          new Paragraph({
            text: proposal.problem_statement,
            spacing: { after: 300 },
          }),

          // Proposed Solution
          new Paragraph({
            text: 'Proposed Solution',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          }),
          new Paragraph({
            text: proposal.proposed_solution,
            spacing: { after: 300 },
          }),

          // Deliverables
          new Paragraph({
            text: 'Deliverables',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          }),
          ...proposal.deliverables.map(
            (d) =>
              new Paragraph({
                children: [
                  new TextRun({ text: `• ${d.title}: `, bold: true }),
                  new TextRun({ text: d.description }),
                ],
                spacing: { after: 100 },
              })
          ),

          // Timeline
          new Paragraph({
            text: 'Project Timeline',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          }),
          ...proposal.timeline.flatMap((phase) => [
            new Paragraph({
              children: [
                new TextRun({ text: `${phase.phase} (${phase.duration})`, bold: true }),
              ],
              spacing: { after: 100 },
            }),
            ...phase.milestones.map(
              (m) =>
                new Paragraph({
                  text: `  - ${m}`,
                  spacing: { after: 80 },
                })
            ),
          ]),

          // Pricing
          new Paragraph({
            text: 'Investment',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                tableHeader: true,
                children: ['Item', 'Qty', 'Unit Price', 'Total'].map(
                  (header) =>
                    new TableCell({
                      children: [
                        new Paragraph({
                          children: [new TextRun({ text: header, bold: true })],
                        }),
                      ],
                      borders: {
                        bottom: { style: BorderStyle.SINGLE, size: 2, color: '333333' },
                      },
                    })
                ),
              }),
              ...proposal.pricing.map(
                (item) =>
                  new TableRow({
                    children: [
                      item.item,
                      String(item.qty),
                      formatCurrency(item.unit_price),
                      formatCurrency(item.total),
                    ].map(
                      (cell) =>
                        new TableCell({
                          children: [new Paragraph({ text: cell })],
                        })
                    ),
                  })
              ),
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [new TextRun({ text: 'TOTAL', bold: true })],
                      }),
                    ],
                    columnSpan: 3,
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ text: formatCurrency(proposal.pricing_total), bold: true }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),

          // Assumptions
          new Paragraph({
            text: 'Assumptions',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          }),
          ...proposal.assumptions.map(
            (a) =>
              new Paragraph({
                text: `• ${a}`,
                spacing: { after: 80 },
              })
          ),

          // Next Steps
          new Paragraph({
            text: 'Next Steps',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          }),
          ...proposal.next_steps.map(
            (step, i) =>
              new Paragraph({
                text: `${i + 1}. ${step}`,
                spacing: { after: 80 },
              })
          ),
        ],
      },
    ],
  })

  return await Packer.toBuffer(doc)
}
