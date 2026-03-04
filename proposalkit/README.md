# ProposalKit

Generate polished, professional proposals in under 60 seconds using AI.

## Overview

ProposalKit is a production-ready SaaS MVP for agencies. Enter your client details, let the AI write a complete proposal, then export to PDF or DOCX.

## Features

- **One-Shot & Wizard modes** — Quick generation or guided 5-step flow
- **AI-powered** — LLM generates executive summary, deliverables, timeline, pricing, and next steps
- **PDF & DOCX export** — Server-side PDF via Puppeteer; DOCX via pure-JS `docx` library
- **Brand Kit** — Agency name, logo, colors, tone of voice applied automatically
- **5 built-in templates** — Web, SEO, Branding, Social Media, Software
- **Full marketing site** — Home, pricing, how-it-works, templates, privacy, terms, contact
- **Supabase auth** — Email/password and magic link
- **Route protection** — Middleware guards all `/dashboard`, `/proposals`, etc.

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Auth & DB | Supabase (Postgres + RLS) |
| LLM | OpenAI SDK (any OpenAI-compatible provider) |
| Styling | Tailwind CSS + shadcn/ui primitives |
| Forms | react-hook-form + zod |
| PDF | puppeteer-core + @sparticuz/chromium-min |
| DOCX | docx (pure JS) |

## Getting Started

### 1. Clone and install

```bash
cd proposalkit
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Set up Supabase

Run schema and seed files in your Supabase SQL editor:

```bash
# Or directly via psql
psql $DATABASE_URL < supabase/schema.sql
psql $DATABASE_URL < supabase/seed.sql
```

### 4. Run dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
proposalkit/
├── app/
│   ├── (marketing)/        # Public marketing pages
│   ├── (app)/              # Authenticated app pages
│   ├── auth/               # Login, signup, OAuth callback
│   └── api/                # API routes (generate, export)
├── components/
│   ├── marketing/          # Navbar, Hero, etc.
│   ├── dashboard/          # ProposalCard, EmptyState
│   ├── proposals/          # Forms, ProposalView, ExportButtons
│   └── shared/             # AppSidebar, PageHeader
├── lib/
│   ├── supabase/           # Browser + server clients
│   ├── llm/                # Client, prompts, Zod schema
│   ├── docx/               # DOCX generator
│   └── proposal-renderer.ts # HTML renderer for PDF
├── supabase/
│   ├── schema.sql          # Full DB schema + RLS
│   └── seed.sql            # 5 built-in templates
└── types/index.ts          # Shared TypeScript types
```

## Running Tests

```bash
npm test
```

Tests cover the Zod schema validation for `ProposalJSON`.

## Deployment

Deploy to Vercel:

```bash
vercel deploy
```

Add environment variables in the Vercel dashboard. The PDF route uses `@sparticuz/chromium-min` and requires Vercel Pro for the 30s timeout; on free tier, the client falls back to `window.print()`.

## Feature Flags

| Flag | Default | Description |
|---|---|---|
| `NEXT_PUBLIC_PAYMENTS_ENABLED` | `false` | Enable payments UI |

## LLM Provider Swap

Change `OPENAI_BASE_URL` to any OpenAI-compatible endpoint:

```env
OPENAI_BASE_URL=https://api.anthropic.com/v1   # Claude via proxy
OPENAI_BASE_URL=http://localhost:11434/v1       # Ollama
OPENAI_MODEL=llama3
```
