import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { html } = await request.json()

    if (!html || typeof html !== 'string') {
      return NextResponse.json({ error: 'html is required' }, { status: 400 })
    }

    // Dynamic imports to avoid issues at module load time
    const chromium = await import('@sparticuz/chromium-min')
    const puppeteer = await import('puppeteer-core')

    const browser = await puppeteer.default.launch({
      args: chromium.default.args,
      defaultViewport: chromium.default.defaultViewport,
      executablePath: await chromium.default.executablePath(
        'https://github.com/Sparticuz/chromium/releases/download/v123.0.1/chromium-v123.0.1-pack.tar'
      ),
      headless: true,
    })

    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: 'networkidle0' })

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' },
    })

    await browser.close()

    return new NextResponse(pdf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="proposal.pdf"',
      },
    })
  } catch (err) {
    console.error('PDF export error:', err)
    // Return 500 so the client falls back to window.print()
    return NextResponse.json({ error: 'PDF generation failed' }, { status: 500 })
  }
}

export const maxDuration = 30
