-- ProposalKit Seed Data — 5 Built-in Templates
-- Run AFTER schema.sql

INSERT INTO public.templates (name, description, category, is_builtin, proposal_json) VALUES

-- Template 1: Web Design & Development
(
  'Web Design & Development',
  'Full website redesign and development for small-to-medium businesses',
  'web',
  true,
  '{
    "title": "Website Redesign & Development Proposal",
    "client": { "name": "[CLIENT NAME]", "industry": "[INDUSTRY]" },
    "agency": { "name": "[AGENCY NAME]", "tagline": "Building Digital Experiences" },
    "executive_summary": "We propose a comprehensive website redesign that will modernize your online presence, improve user experience, and drive measurable business results. Our team will deliver a fast, mobile-first website built on modern technology that reflects your brand and converts visitors into customers.",
    "problem_statement": "Your current website does not effectively communicate your value proposition or convert visitors. Slow load times, poor mobile experience, and outdated design are costing you potential customers every day.",
    "proposed_solution": "We will design and develop a modern, responsive website using Next.js and Tailwind CSS. The new site will include clear calls-to-action, SEO optimization, and a content management system so your team can update content without developer help.",
    "deliverables": [
      { "title": "Discovery & Strategy", "description": "Stakeholder interviews, competitor analysis, and sitemap planning", "included": true },
      { "title": "UX/UI Design", "description": "Wireframes, visual design mockups, and interactive prototype (up to 10 pages)", "included": true },
      { "title": "Development", "description": "Responsive front-end development with CMS integration", "included": true },
      { "title": "SEO Foundation", "description": "On-page SEO setup, sitemap, robots.txt, schema markup", "included": true },
      { "title": "Launch & Training", "description": "Deployment, DNS configuration, and 1-hour CMS training session", "included": true }
    ],
    "timeline": [
      { "phase": "Discovery & Design", "duration": "2 weeks", "milestones": ["Kick-off call", "Sitemap approved", "Design mockups delivered"] },
      { "phase": "Development", "duration": "3 weeks", "milestones": ["Dev environment setup", "Front-end complete", "CMS configured"] },
      { "phase": "QA & Launch", "duration": "1 week", "milestones": ["Cross-browser testing", "Client review", "Go live"] }
    ],
    "pricing": [
      { "item": "Discovery & Strategy", "qty": 1, "unit_price": 1500, "total": 1500 },
      { "item": "UX/UI Design (10 pages)", "qty": 1, "unit_price": 4000, "total": 4000 },
      { "item": "Development", "qty": 1, "unit_price": 6000, "total": 6000 },
      { "item": "SEO Foundation", "qty": 1, "unit_price": 800, "total": 800 },
      { "item": "Launch & Training", "qty": 1, "unit_price": 700, "total": 700 }
    ],
    "pricing_total": 13000,
    "assumptions": [
      "Client will provide all copy and brand assets within 5 business days of kick-off",
      "Up to 3 rounds of design revisions are included",
      "Hosting and domain costs are not included"
    ],
    "next_steps": [
      "Sign proposal and return to [AGENCY NAME]",
      "Submit 50% deposit to begin work",
      "Schedule kick-off call",
      "Provide brand assets and content"
    ],
    "generated_at": "2024-01-01T00:00:00.000Z"
  }'::jsonb
),

-- Template 2: SEO & Content Marketing
(
  'SEO & Content Marketing',
  'Ongoing SEO retainer and content strategy for growing organic traffic',
  'marketing',
  true,
  '{
    "title": "SEO & Content Marketing Retainer Proposal",
    "client": { "name": "[CLIENT NAME]", "industry": "[INDUSTRY]" },
    "agency": { "name": "[AGENCY NAME]", "tagline": "Growing Organic Visibility" },
    "executive_summary": "We propose a 6-month SEO and content marketing retainer designed to increase your organic search visibility, drive qualified traffic, and generate leads. Our data-driven approach combines technical SEO, strategic content creation, and link building to deliver sustainable results.",
    "problem_statement": "Your website is not ranking for the keywords your potential customers are searching. Competitors are capturing traffic and leads that should be yours. Without a consistent content and SEO strategy, this gap will only widen.",
    "proposed_solution": "A comprehensive monthly retainer covering technical SEO audits, keyword-targeted content production, on-page optimization, and authority link building. We will establish a content calendar aligned with your business goals and report on KPIs monthly.",
    "deliverables": [
      { "title": "Technical SEO Audit", "description": "Full site audit with prioritized fix list in month 1", "included": true },
      { "title": "Keyword Research", "description": "Comprehensive keyword mapping document", "included": true },
      { "title": "Monthly Content", "description": "4 SEO-optimized blog posts per month (1,200+ words each)", "included": true },
      { "title": "On-Page Optimization", "description": "Meta tags, headers, internal linking for up to 8 pages/month", "included": true },
      { "title": "Link Building", "description": "3-5 quality backlinks per month via outreach", "included": true },
      { "title": "Monthly Reporting", "description": "Traffic, rankings, and conversions report with recommendations", "included": true }
    ],
    "timeline": [
      { "phase": "Month 1: Foundation", "duration": "1 month", "milestones": ["Technical audit complete", "Keyword map delivered", "Content calendar approved"] },
      { "phase": "Months 2-4: Growth", "duration": "3 months", "milestones": ["16 articles published", "40+ backlinks built", "Rankings improving"] },
      { "phase": "Months 5-6: Scale", "duration": "2 months", "milestones": ["Top 3 rankings for target keywords", "Traffic increase measurable", "Strategy review"] }
    ],
    "pricing": [
      { "item": "Monthly SEO & Content Retainer", "qty": 6, "unit_price": 3500, "total": 21000 }
    ],
    "pricing_total": 21000,
    "assumptions": [
      "Client will review and approve content within 3 business days",
      "Client has Google Search Console and Analytics access to share",
      "Results timeline assumes no major algorithm updates"
    ],
    "next_steps": [
      "Sign 6-month retainer agreement",
      "Grant access to Google Search Console and Analytics",
      "Schedule onboarding call",
      "Submit first monthly invoice"
    ],
    "generated_at": "2024-01-01T00:00:00.000Z"
  }'::jsonb
),

-- Template 3: Brand Identity
(
  'Brand Identity Design',
  'Logo design and complete brand identity system for new or rebranding businesses',
  'branding',
  true,
  '{
    "title": "Brand Identity Design Proposal",
    "client": { "name": "[CLIENT NAME]", "industry": "[INDUSTRY]" },
    "agency": { "name": "[AGENCY NAME]", "tagline": "Crafting Memorable Brands" },
    "executive_summary": "A strong brand identity is the foundation of all your marketing and communications. We propose a comprehensive brand identity project that will give you a distinctive logo, cohesive visual language, and a brand guidelines document your team and vendors can rely on.",
    "problem_statement": "Without a consistent brand identity, your business appears fragmented across touchpoints. Customers struggle to recognize and remember you, and your marketing materials look disjointed, undermining trust and professionalism.",
    "proposed_solution": "We will guide you through a structured brand discovery process, then design a logo system and full visual identity including color palette, typography, iconography, and usage guidelines. You will receive all final files in every format you will ever need.",
    "deliverables": [
      { "title": "Brand Discovery Workshop", "description": "2-hour facilitated session to define brand positioning, values, and personality", "included": true },
      { "title": "Logo Design", "description": "Primary logo, secondary logo, and icon/favicon — 3 initial concepts, 2 revision rounds", "included": true },
      { "title": "Color System", "description": "Primary and secondary palette with HEX, RGB, CMYK, and Pantone values", "included": true },
      { "title": "Typography System", "description": "Heading, body, and accent font selections with pairing guidelines", "included": true },
      { "title": "Brand Guidelines Document", "description": "35+ page PDF brand book with usage rules and examples", "included": true },
      { "title": "File Delivery", "description": "All logo files in SVG, PNG, EPS, PDF formats on a shared drive", "included": true }
    ],
    "timeline": [
      { "phase": "Discovery", "duration": "1 week", "milestones": ["Brand workshop completed", "Creative brief approved"] },
      { "phase": "Concept Design", "duration": "2 weeks", "milestones": ["3 logo concepts presented", "Direction selected"] },
      { "phase": "Refinement", "duration": "1 week", "milestones": ["2 revision rounds complete", "Logo finalized"] },
      { "phase": "Brand System", "duration": "1 week", "milestones": ["Color and type systems complete", "Brand guidelines delivered"] }
    ],
    "pricing": [
      { "item": "Brand Discovery Workshop", "qty": 1, "unit_price": 800, "total": 800 },
      { "item": "Logo Design System", "qty": 1, "unit_price": 3500, "total": 3500 },
      { "item": "Visual Identity System", "qty": 1, "unit_price": 2200, "total": 2200 },
      { "item": "Brand Guidelines Document", "qty": 1, "unit_price": 1500, "total": 1500 }
    ],
    "pricing_total": 8000,
    "assumptions": [
      "Client will complete a pre-project questionnaire before the workshop",
      "Revisions beyond 2 rounds billed at $150/hour",
      "Print production costs are not included"
    ],
    "next_steps": [
      "Sign proposal and return 50% deposit",
      "Complete pre-project questionnaire",
      "Schedule brand discovery workshop",
      "Gather reference materials and competitor examples"
    ],
    "generated_at": "2024-01-01T00:00:00.000Z"
  }'::jsonb
),

-- Template 4: Social Media Management
(
  'Social Media Management',
  'Monthly social media management and content creation retainer',
  'social',
  true,
  '{
    "title": "Social Media Management Proposal",
    "client": { "name": "[CLIENT NAME]", "industry": "[INDUSTRY]" },
    "agency": { "name": "[AGENCY NAME]", "tagline": "Building Your Community" },
    "executive_summary": "Consistent, strategic social media presence is essential for brand awareness and customer engagement. We propose a fully managed social media retainer covering content creation, scheduling, community management, and performance reporting across your key platforms.",
    "problem_statement": "Maintaining an active, professional social media presence requires significant time and creative resources. Inconsistent posting, low-quality content, and lack of strategy mean your brand is missing opportunities to connect with your audience and grow.",
    "proposed_solution": "Our team will manage your social media end-to-end: monthly strategy sessions, content creation, scheduling, responding to comments, and delivering insights reports. You approve content before it goes live, but we handle all the execution.",
    "deliverables": [
      { "title": "Content Strategy", "description": "Monthly content calendar with themes, post types, and copy", "included": true },
      { "title": "Graphic Design", "description": "16 custom-designed social graphics per month", "included": true },
      { "title": "Copywriting", "description": "All captions, hashtags, and CTAs written and optimized", "included": true },
      { "title": "Scheduling", "description": "Content scheduled at optimal times across platforms", "included": true },
      { "title": "Community Management", "description": "Responding to comments and DMs (business hours, Mon-Fri)", "included": true },
      { "title": "Monthly Report", "description": "Reach, engagement, follower growth, and recommendations", "included": true }
    ],
    "timeline": [
      { "phase": "Onboarding", "duration": "1 week", "milestones": ["Account access granted", "Brand assets received", "Platform audit complete"] },
      { "phase": "Month 1", "duration": "1 month", "milestones": ["Content calendar approved", "All posts scheduled", "Baseline metrics recorded"] },
      { "phase": "Ongoing", "duration": "Monthly", "milestones": ["Monthly report delivered", "Strategy call completed", "Next month calendar approved"] }
    ],
    "pricing": [
      { "item": "Social Media Management Retainer (2 platforms)", "qty": 1, "unit_price": 2200, "total": 2200 },
      { "item": "Additional Platform Add-on", "qty": 0, "unit_price": 600, "total": 0 }
    ],
    "pricing_total": 2200,
    "assumptions": [
      "Covers Instagram and LinkedIn (additional platforms available as add-ons)",
      "Client will approve content calendar by the 25th of each prior month",
      "Ad spend budget is not included in this proposal"
    ],
    "next_steps": [
      "Sign retainer agreement",
      "Grant social media account access",
      "Share brand guidelines and asset library",
      "Schedule onboarding call"
    ],
    "generated_at": "2024-01-01T00:00:00.000Z"
  }'::jsonb
),

-- Template 5: Software / App Development
(
  'Custom Software Development',
  'Custom web application or MVP development for startups and businesses',
  'software',
  true,
  '{
    "title": "Custom Software Development Proposal",
    "client": { "name": "[CLIENT NAME]", "industry": "[INDUSTRY]" },
    "agency": { "name": "[AGENCY NAME]", "tagline": "Building Products That Scale" },
    "executive_summary": "We propose to design, develop, and deploy a custom web application that solves your specific business challenge. Our agile development process ensures transparency, regular deliverables, and a production-ready product that is built to scale.",
    "problem_statement": "Off-the-shelf software does not meet your specific workflow requirements, forcing your team to work around limitations or use multiple disconnected tools. A purpose-built solution will eliminate inefficiencies and give you a competitive advantage.",
    "proposed_solution": "We will build a custom web application using a modern, proven tech stack (Next.js, PostgreSQL, cloud hosting). The project follows an agile process with 2-week sprints, weekly demos, and continuous delivery so you see progress and can provide feedback throughout.",
    "deliverables": [
      { "title": "Technical Architecture", "description": "System design document, database schema, API specification", "included": true },
      { "title": "UI/UX Design", "description": "Wireframes and high-fidelity designs for all core user flows", "included": true },
      { "title": "Core Application", "description": "All features in the agreed scope, tested and deployed to staging", "included": true },
      { "title": "Authentication & Permissions", "description": "User accounts, roles, and secure session management", "included": true },
      { "title": "Admin Dashboard", "description": "Internal tools for managing users and data", "included": true },
      { "title": "Deployment & DevOps", "description": "Production deployment, CI/CD pipeline, environment configuration", "included": true },
      { "title": "Documentation", "description": "Technical documentation and user guide", "included": true }
    ],
    "timeline": [
      { "phase": "Sprint 0: Planning", "duration": "1 week", "milestones": ["Requirements finalized", "Architecture approved", "Sprint backlog created"] },
      { "phase": "Sprints 1-2: Foundation", "duration": "4 weeks", "milestones": ["Auth system live", "Database schema implemented", "Core UI scaffolded"] },
      { "phase": "Sprints 3-5: Core Features", "duration": "6 weeks", "milestones": ["All primary features complete", "Internal testing passed", "Client demo approved"] },
      { "phase": "Sprint 6: Polish & Launch", "duration": "2 weeks", "milestones": ["QA complete", "Performance optimized", "Production deployment"] }
    ],
    "pricing": [
      { "item": "Project Discovery & Architecture", "qty": 1, "unit_price": 3000, "total": 3000 },
      { "item": "UX/UI Design", "qty": 1, "unit_price": 5000, "total": 5000 },
      { "item": "Development (13 weeks)", "qty": 13, "unit_price": 3500, "total": 45500 },
      { "item": "QA & Testing", "qty": 1, "unit_price": 2500, "total": 2500 },
      { "item": "Deployment & DevOps Setup", "qty": 1, "unit_price": 2000, "total": 2000 }
    ],
    "pricing_total": 58000,
    "assumptions": [
      "Scope is fixed to features listed; changes require a change order",
      "Client has final decision-making authority with max 48-hour turnaround on approvals",
      "Hosting and infrastructure costs are not included",
      "Post-launch support available as a separate retainer"
    ],
    "next_steps": [
      "Sign development agreement",
      "Submit 30% project deposit",
      "Schedule Sprint 0 planning session",
      "Provide access to any existing systems or data"
    ],
    "generated_at": "2024-01-01T00:00:00.000Z"
  }'::jsonb
);
