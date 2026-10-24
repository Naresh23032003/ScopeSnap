import {
  CurrencyConfig,
  RiskBufferOption,
  PaymentSchedule,
  VaguePhrasePattern,
  ClientChaosPreset,
  ScopeProposal,
} from "./types";

/**
 * lib/constants.ts
 * Authoritative configurations, presets, regex patterns, and fallback proposal datasets for ScopeSnap.
 * Strict constraint: Zero em dashes (U+2014) anywhere in code or comments.
 */

// =============================================================================
// 1. Currency & Hourly Rate Configurations
// =============================================================================

export const CURRENCY_CONFIGS: Record<"USD" | "INR" | "EUR" | "GBP", CurrencyConfig> = {
  USD: {
    symbol: "$",
    code: "USD",
    minRate: 25,
    maxRate: 250,
    defaultRate: 100,
    step: 5,
  },
  INR: {
    symbol: "\u20B9",
    code: "INR",
    minRate: 1500,
    maxRate: 15000,
    defaultRate: 5000,
    step: 500,
  },
  EUR: {
    symbol: "\u20AC",
    code: "EUR",
    minRate: 25,
    maxRate: 250,
    defaultRate: 90,
    step: 5,
  },
  GBP: {
    symbol: "\u00A3",
    code: "GBP",
    minRate: 20,
    maxRate: 200,
    defaultRate: 80,
    step: 5,
  },
};

// =============================================================================
// 2. Risk Buffer Multipliers
// =============================================================================

export const RISK_BUFFERS: Record<"STANDARD" | "GUARDED" | "IRONCLAD", RiskBufferOption> = {
  STANDARD: {
    key: "1.0x",
    multiplier: 1.0,
    label: "Clean Scope (0% Buffer)",
  },
  GUARDED: {
    key: "+15%",
    multiplier: 1.15,
    label: "Moderate Ambiguity (+15% Buffer)",
  },
  IRONCLAD: {
    key: "+35%",
    multiplier: 1.35,
    label: "High Client Chaos (+35% Buffer)",
  },
};

// =============================================================================
// 3. Payment Schedules
// =============================================================================

export const PAYMENT_SCHEDULES: readonly PaymentSchedule[] = [
  "50/50",
  "40/30/30",
  "retainer",
] as const;

// =============================================================================
// 4. Vague Phrase Warning Scanner Regex Catalog (10 Core Patterns)
// =============================================================================

export const VAGUE_PHRASE_PATTERNS: VaguePhrasePattern[] = [
  {
    id: "simple",
    phrase: "simple",
    regex: /\b(simple|super\s+simple)\b/gi,
    category: "Ambiguity",
    riskExplanation: "Subjective complexity trap. Simple features usually hide massive backend edge cases.",
  },
  {
    id: "quick",
    phrase: "quick",
    regex: /\b(quick|quickly)\b/gi,
    category: "Timeline",
    riskExplanation: "Timeline compression hazard. Diminishes architectural planning and test cycles.",
  },
  {
    id: "maybe_later",
    phrase: "maybe later",
    regex: /\b(maybe\s+later|down\s+the\s+road)\b/gi,
    category: "Scope Creep",
    riskExplanation: "Uncommitted boundary. Requires immediate architectural accommodation without payment.",
  },
  {
    id: "asap",
    phrase: "ASAP",
    regex: /\b(ASAP|as\s+soon\s+as\s+possible)\b/gi,
    category: "Rush Hazard",
    riskExplanation: "Emergency urgency lacking milestone definition; triggers standard rush premium.",
  },
  {
    id: "etc",
    phrase: "etc.",
    regex: /\b(etc\.?|and\s+so\s+on)\b/gi,
    category: "Open-Ended",
    riskExplanation: "Infinite scope leak. Etc. allows clients to inject unbilled additions indefinitely.",
  },
  {
    id: "similar_to_uber",
    phrase: "similar to Uber/Airbnb",
    regex: /\b(similar\s+to|like)\s+(uber|airbnb|amazon|netflix|twitter|facebook|notion)\b/gi,
    category: "Anchoring",
    riskExplanation: "Multi-billion dollar platform comparison. Extreme distortion of MVP scope.",
  },
  {
    id: "unlimited",
    phrase: "unlimited",
    regex: /\b(unlimited)\b/gi,
    category: "Liability",
    riskExplanation: "Infinite liability trap (unlimited revisions, variants, or server queries).",
  },
  {
    id: "just",
    phrase: "just",
    regex: /\bjust\s+(hook\s+up|add|build|make|tweak|change|do|squeeze\s+in)\b/gi,
    category: "Minimization",
    riskExplanation: "Minimization phrasing. Masks multi-day engineering effort as trivial tweaks.",
  },
  {
    id: "few_hours",
    phrase: "a few hours",
    regex: /\b(a\s+few\s+hours|couple\s+of\s+hours|trivial)\b/gi,
    category: "Price Anchor",
    riskExplanation: "Client anchoring trap attempting to pre-determine senior engineering hours.",
  },
  {
    id: "unlimited_revisions",
    phrase: "unlimited revisions",
    regex: /\bunlimited\s+revisions?\b/gi,
    category: "Fatal Creep",
    riskExplanation: "Agency profit killer. SOW must strictly limit revisions to 2 formalized rounds.",
  },
];

// =============================================================================
// 5. Realistic Client Chaos Presets
// =============================================================================

export const CLIENT_CHAOS_PRESETS: ClientChaosPreset[] = [
  {
    id: "preset-1",
    category: "E-Commerce & Retail",
    label: "E-Commerce Rebuild Dump",
    subtitle: "Shopify to Custom Next.js Migration",
    badge: "High Complexity",
    rawText: `Hey team! We need to rebuild our current Shopify store into a custom modern web app. It needs to be super simple and quick, ideally live in 2 weeks ASAP. We want something similar to Uber/Airbnb where users can book custom delivery slots, plus unlimited product variants. Also maybe later we will add AI recommendations, a multi-vendor marketplace, and custom mobile apps for iOS and Android, etc. Our current site has around 5,000 SKUs. We also need custom ERP integration and a blazing fast search engine. Budget is tight but we have lots of follow-up work!`,
  },
  {
    id: "preset-2",
    category: "AI & B2B SaaS",
    label: "AI SaaS MVP Call Notes",
    subtitle: "Voice Transcript / Raw Meeting Dump",
    badge: "Architecture Risk",
    rawText: `Client call notes with Dave (Founder):
- Wants a B2B AI document analysis platform like Notion AI meets ChatPDF.
- Needs PDF upload, semantic chunking, vector database (Pinecone or pgvector), and Groq or OpenAI streaming.
- Said: "Should be quick, just hook up some APIs, right? Maybe later we add Slack bot, team seats, Stripe billing with usage metering, and SOC2 compliance."
- Must support 500-page financial PDFs without crashing.
- Wants an admin dashboard for token usage tracking.
- Launch target: end of next month.
- Client asked: "Can we do unlimited queries for early beta testers?" (Major cost trap!)`,
  },
  {
    id: "preset-3",
    category: "Design & Marketing",
    label: "Urgent Landing Page + Branding",
    subtitle: "High-Pressure Agency Sprint",
    badge: "Urgent Sprint",
    rawText: `From Slack:
"Need a high-converting 5-page landing page + brand refresh by Friday ASAP! Full 3D interactive splines, custom illustrations, responsive for all devices, dark/light mode toggle. We also need custom email templates, pitch deck design, and SEO optimization. Don't worry about copy, we will write it later (or just use lorem ipsum for now, but design must fit perfectly). We want unlimited revisions until the board signs off. It's a quick simple project, should take a few hours for a senior dev."`,
  },
  {
    id: "preset-4",
    category: "Expansion Creep",
    label: "Scope Creep Follow-up Email",
    subtitle: "Post-Kickoff Expansion Trap",
    badge: "Creep Hazard",
    rawText: `Hi team, just following up on our kickoff! While you're building the core auth and user profile pages, could we also quickly squeeze in:
1. Social logins (Google, Apple, GitHub, Twitter, LinkedIn)
2. Role-based access control with custom permission matrices
3. Two-factor authentication (SMS + Authenticator app)
4. Activity audit logs exportable to CSV
Should be trivial since auth is already in progress, right? We won't need to adjust the deadline or budget for these minor tweaks. Also etc., let's discuss adding localization for 8 languages next week.`,
  },
];

// =============================================================================
// 6. Realistic Mock Scope Proposals for Context-Aware Fallbacks
// =============================================================================

export const PROPOSAL_PRESET_1: ScopeProposal = {
  projectTitle: "Next.js Custom E-Commerce Platform Rebuild",
  clientSummary:
    "Migration from legacy Shopify store with 5,000 SKUs to a high-speed headless Next.js commerce architecture. Scope covers core catalog, delivery slot booking engine, and secure checkout while establishing explicit boundaries against unbudgeted multi-vendor marketplace and native mobile app creep.",
  detectedTraps: [
    "Vague 'simple and quick' 2-week deadline for complex 5,000 SKU migration",
    "Anchoring to 'Uber/Airbnb' delivery slot reservation engine without backend fleet schema",
    "Unbounded 'unlimited product variants' risking database index bloat",
    "Casual mention of 'maybe later' AI recommendations, multi-vendor marketplace, and native mobile apps",
    "Undefined custom ERP integration scope and authentication protocols",
  ],
  milestones: [
    {
      id: "phase-01",
      phase: "Phase 01",
      title: "Architecture, Data Schema & Discovery",
      deliverables: [
        {
          id: "d-101",
          name: "Headless Commerce Architecture & Next.js App Router Blueprint",
          hours: 16,
          complexity: "Med",
          included: true,
        },
        {
          id: "d-102",
          name: "5,000 SKU Catalog Data Schema & PostgreSQL / Prisma Modeling",
          hours: 20,
          complexity: "High",
          included: true,
        },
        {
          id: "d-103",
          name: "Custom Delivery Slot Booking State Machine & Schedule Architecture",
          hours: 18,
          complexity: "High",
          included: true,
        },
        {
          id: "d-104",
          name: "Interactive High-Fidelity Design Tokens & Component System",
          hours: 14,
          complexity: "Med",
          included: true,
        },
      ],
      phaseTotalHours: 68,
    },
    {
      id: "phase-02",
      phase: "Phase 02",
      title: "Core Build, Delivery Engine & Integrations",
      deliverables: [
        {
          id: "d-201",
          name: "High-Performance Product Catalog & Dynamic Variant Selector",
          hours: 24,
          complexity: "Med",
          included: true,
        },
        {
          id: "d-202",
          name: "Delivery Slot Calendar & Real-Time Availability Lock Engine",
          hours: 28,
          complexity: "High",
          included: true,
        },
        {
          id: "d-203",
          name: "Stripe Elements Payment Checkout & Order Fulfillment Webhooks",
          hours: 18,
          complexity: "Med",
          included: true,
        },
        {
          id: "d-204",
          name: "Transactional Notification System (Email + Order Confirmation)",
          hours: 12,
          complexity: "Low",
          included: true,
        },
      ],
      phaseTotalHours: 82,
    },
    {
      id: "phase-03",
      phase: "Phase 03",
      title: "Hardening, Data Migration, QA & Launch",
      deliverables: [
        {
          id: "d-301",
          name: "Shopify CSV to PostgreSQL Catalog Migration & Validation Script",
          hours: 22,
          complexity: "High",
          included: true,
        },
        {
          id: "d-302",
          name: "End-to-End Cypress / Playwright Checkout & Booking Test Suite",
          hours: 16,
          complexity: "Med",
          included: true,
        },
        {
          id: "d-303",
          name: "Vercel Enterprise Edge Deployment, Domain DNS & SSL Cutover",
          hours: 10,
          complexity: "Low",
          included: true,
        },
        {
          id: "d-304",
          name: "Admin Training Handoff & Technical SOW Sign-off Documentation",
          hours: 8,
          complexity: "Low",
          included: true,
        },
      ],
      phaseTotalHours: 56,
    },
  ],
  outOfScope: [
    "Native iOS and Android mobile app development (PWA supported only)",
    "Multi-vendor marketplace infrastructure and seller split-payment payouts",
    "AI-powered predictive recommendation engine (slated for Phase 2 roadmap)",
    "Custom legacy ERP synchronization beyond standard REST/JSON webhooks",
    "Uncapped design revision rounds (strictly capped at 2 consolidated cycles)",
    "Third-party API licensing, SMS carrier fees, and hosting subscription costs",
  ],
  assumptions: [
    "Client will provide clean, exported Shopify CSV product catalog and imagery assets prior to Sprint 1",
    "Delivery geographic boundaries are restricted to pre-defined postal code matrices",
    "Standard Stripe account will be provisioned by client with verified merchant credentials",
  ],
  discoveryQuestions: [
    "Which specific ERP software are you using, and does it provide a documented REST API with webhook support?",
    "How are your delivery vehicle capacities currently constrained (by order weight, total volume, or driver shift)?",
    "What is your target peak concurrent order volume during launch week?",
    "Who on your team is authorized to provide final approval on design deliverables?",
  ],
  recommendedReplyEmail: {
    subject: "Proposal & Technical Scope: Custom Next.js E-Commerce Rebuild",
    body: "Hi Dave,\n\nThanks for sharing the vision for the store rebuild! We have analyzed the requirements and structured an actionable, phased Statement of Work designed to launch your high-performance Next.js custom store without risking technical debt.\n\nTo ensure rapid delivery, we have prioritized the core storefront, 5,000 SKU catalog migration, and custom delivery slot booking engine in Phase 1. Advanced features such as multi-vendor marketplace architecture and native mobile apps are cleanly scheduled for Phase 2.\n\nBefore we finalize kickoff, could you review the 4 brief discovery questions in the attached SOW regarding your ERP and delivery parameters?\n\nLooking forward to building this together!\n\nBest regards,\nEngineering Team",
  },
  demoMode: true,
};

export const PROPOSAL_PRESET_2: ScopeProposal = {
  projectTitle: "AI Document Intelligence & Semantic Analysis SaaS MVP",
  clientSummary:
    "Production-grade B2B SaaS platform for semantic document intelligence. Covers high-concurrency 500-page financial PDF ingestion, recursive text chunking, vector indexing in Pinecone/pgvector, streaming Groq/OpenAI completions, and token analytics dashboard with strict boundaries against unmetered AI usage.",
  detectedTraps: [
    "Dangerous 'unlimited queries' expectation causing catastrophic API token cost burn",
    "Casual 'should be quick just hook up APIs' minimization of vector pipeline latency",
    "Premature mention of SOC2 compliance and team seats without enterprise budget",
    "Handling 500-page complex financial PDFs without dedicated asynchronous worker queues",
  ],
  milestones: [
    {
      id: "phase-01",
      phase: "Phase 01",
      title: "Architecture, Discovery & Vector Data Schema",
      deliverables: [
        {
          id: "d-2101",
          name: "Semantic Ingestion Architecture & Document Chunking Pipeline",
          hours: 18,
          complexity: "High",
          included: true,
        },
        {
          id: "d-2102",
          name: "Pinecone / pgvector Index Schema & Metadata Filtering Strategy",
          hours: 16,
          complexity: "Med",
          included: true,
        },
        {
          id: "d-2103",
          name: "Groq LPU Streaming Client & Fallback Inference Provider Setup",
          hours: 14,
          complexity: "Med",
          included: true,
        },
        {
          id: "d-2104",
          name: "Asynchronous Background Processing Queue Architecture (Redis/BullMQ)",
          hours: 16,
          complexity: "High",
          included: true,
        },
      ],
      phaseTotalHours: 64,
    },
    {
      id: "phase-02",
      phase: "Phase 02",
      title: "Core Build, AI Search Engine & Dashboard",
      deliverables: [
        {
          id: "d-2201",
          name: "500-Page PDF Parser, OCR Extraction & Tabular Data Reconstructor",
          hours: 26,
          complexity: "High",
          included: true,
        },
        {
          id: "d-2202",
          name: "Interactive Document Viewer with Citation Highlight & Source Jump",
          hours: 22,
          complexity: "Med",
          included: true,
        },
        {
          id: "d-2203",
          name: "User Token Usage Metering & Tier-Gated Query Limiting Engine",
          hours: 18,
          complexity: "High",
          included: true,
        },
        {
          id: "d-2204",
          name: "Admin Analytics Dashboard for LLM Latency & Cost Tracking",
          hours: 16,
          complexity: "Med",
          included: true,
        },
      ],
      phaseTotalHours: 82,
    },
    {
      id: "phase-03",
      phase: "Phase 03",
      title: "Hardening, Security Auditing & Launch",
      deliverables: [
        {
          id: "d-2301",
          name: "Prompt Injection Defense & PII Redaction Middleware Layer",
          hours: 16,
          complexity: "High",
          included: true,
        },
        {
          id: "d-2302",
          name: "High-Volume PDF Ingestion Stress Testing & Benchmark Suite",
          hours: 14,
          complexity: "Med",
          included: true,
        },
        {
          id: "d-2303",
          name: "Cloud Deployment Pipeline, Vector Index Backup & SSL Configuration",
          hours: 12,
          complexity: "Low",
          included: true,
        },
        {
          id: "d-2304",
          name: "Developer Documentation, API Specs & Admin Handoff Session",
          hours: 8,
          complexity: "Low",
          included: true,
        },
      ],
      phaseTotalHours: 50,
    },
  ],
  outOfScope: [
    "Uncapped or unmetered LLM token consumption (strictly rate-limited per tier)",
    "Formal SOC2 Type II audit certification or external auditor compliance filings",
    "Slack or Microsoft Teams conversational bot integration (Phase 2 feature)",
    "Fine-tuning custom proprietary foundation models from scratch",
    "Multi-tenant SSO enterprise federation (SAML / Okta)",
    "Third-party vector database licensing and Groq/OpenAI API inference costs",
  ],
  assumptions: [
    "Client will furnish verified Groq and Pinecone/OpenAI API keys with appropriate usage tiers",
    "Sample financial PDF documents for test ingestion will be provided prior to Sprint 1",
    "Client understands that LLM queries incur variable API usage costs based on token consumption",
  ],
  discoveryQuestions: [
    "What is your expected monthly document ingestion volume and average page count per file?",
    "Do you require OCR for scanned bitmap documents or are files standard searchable digital PDFs?",
    "What hard dollar monthly spend cap should be configured for the LLM inference provider?",
    "Which authentication provider do you plan to use for initial beta testers (e.g. Supabase, Clerk)?",
  ],
  recommendedReplyEmail: {
    subject: "Technical Proposal: AI Document Analysis B2B MVP Architecture",
    body: "Hi Dave,\n\nThanks for detailing the requirements for the AI document analysis platform! The product vision is strong, and to protect your runway we have formulated a robust SOW with clear guardrails against unmetered LLM token burn.\n\nWe have scheduled the core ingestion engine, vector indexing, streaming UI, and token metering in Phase 1. Costly enterprise items like SOC2 compliance and Slack integrations are structured for the post-MVP expansion phase.\n\nPlease review our 4 brief discovery questions in the proposal so we can confirm the vector infrastructure setup.\n\nBest regards,\nEngineering Team",
  },
  demoMode: true,
};

export const PROPOSAL_PRESET_3: ScopeProposal = {
  projectTitle: "High-Converting 5-Page Landing Page & Brand Refresh",
  clientSummary:
    "Rapid agency sprint delivering a bespoke 5-page editorial landing page, 3D interactive graphics, and refined brand visual identity. Scope includes dark/light mode toggle, responsive design, and core SEO infrastructure with firm guardrails capping revision cycles.",
  detectedTraps: [
    "Unrealistic 'by Friday ASAP' sprint deadline lacking clear milestone acceptance criteria",
    "Infinite margin killer 'unlimited revisions until board signs off'",
    "Missing copy trap ('write it later or use lorem ipsum') creating structural design refactoring",
    "Anchoring down dev effort to 'few hours for a senior dev'",
  ],
  milestones: [
    {
      id: "phase-01",
      phase: "Phase 01",
      title: "Brand Architecture, Wireframes & Design Tokens",
      deliverables: [
        {
          id: "d-3101",
          name: "Brand Refresh Palette, Typography System & Vector Asset Library",
          hours: 14,
          complexity: "Med",
          included: true,
        },
        {
          id: "d-3102",
          name: "5-Page Interactive Wireframes & Responsive Layout Blueprint",
          hours: 16,
          complexity: "Med",
          included: true,
        },
        {
          id: "d-3103",
          name: "Interactive 3D Spline / Canvas Visual Element Proof of Concept",
          hours: 14,
          complexity: "High",
          included: true,
        },
      ],
      phaseTotalHours: 44,
    },
    {
      id: "phase-02",
      phase: "Phase 02",
      title: "Core Build, Responsive UI & 3D Polish",
      deliverables: [
        {
          id: "d-3201",
          name: "High-Performance 5-Page Next.js Build with Dark / Light Theme Engine",
          hours: 22,
          complexity: "Med",
          included: true,
        },
        {
          id: "d-3202",
          name: "Interactive 3D Spline Scene Optimization & Mobile Fallback",
          hours: 18,
          complexity: "High",
          included: true,
        },
        {
          id: "d-3203",
          name: "Bespoke Transactional Email Template Suite (3 Key Layouts)",
          hours: 10,
          complexity: "Low",
          included: true,
        },
        {
          id: "d-3204",
          name: "Custom Investor Pitch Deck Keynote/Figma Template (10 Slides)",
          hours: 12,
          complexity: "Med",
          included: true,
        },
      ],
      phaseTotalHours: 62,
    },
    {
      id: "phase-03",
      phase: "Phase 03",
      title: "Hardening, SEO Audit, QA & Delivery",
      deliverables: [
        {
          id: "d-3301",
          name: "Technical SEO Optimization, OpenGraph Card Generation & Sitemap",
          hours: 10,
          complexity: "Low",
          included: true,
        },
        {
          id: "d-3302",
          name: "Cross-Device Responsive Testing (iOS Safari, Android Chrome, Mac/Win)",
          hours: 12,
          complexity: "Med",
          included: true,
        },
        {
          id: "d-3303",
          name: "Consolidated Round 1 & Round 2 Review Implementation",
          hours: 14,
          complexity: "Med",
          included: true,
        },
        {
          id: "d-3304",
          name: "Production Domain Cutover, Vercel Edge Cache Tuning & Asset Delivery",
          hours: 8,
          complexity: "Low",
          included: true,
        },
      ],
      phaseTotalHours: 44,
    },
  ],
  outOfScope: [
    "Uncapped design revision rounds (strictly limited to 2 consolidated revision rounds)",
    "Content copywriting and technical marketing copy drafting (provided by client)",
    "Custom video production, 3D character rigging, or audio sound design",
    "Continuous weekly SEO maintenance or paid advertising campaign management",
    "CMS migration beyond static page structure and headless MDX blog setup",
  ],
  assumptions: [
    "Final approved copy or wireframe textual content must be provided by Milestone 2 kickoff",
    "Client stakeholder feedback will be consolidated into a single stakeholder review document",
    "Additional revision cycles beyond the included 2 rounds will be billed at standard hourly rate",
  ],
  discoveryQuestions: [
    "Who is the designated single decision-maker responsible for signing off on design reviews?",
    "What specific 3D visual assets or Spline scenes do you already have created?",
    "When will your internal team provide finalized production copy for the 5 pages?",
    "Are there specific competitor sites whose micro-interactions reflect your desired aesthetic?",
  ],
  recommendedReplyEmail: {
    subject: "Sprint Scope & Milestones: 5-Page Landing Page and Brand Refresh",
    body: "Hi team,\n\nWe have reviewed the Slack brief and mapped out a focused, high-speed sprint package to deliver your 5-page landing page and brand refresh.\n\nTo meet your aggressive target safely, we have included 2 dedicated review rounds and itemized the deliverables across architecture, build, and QA. We explicitly exclude unbudgeted unlimited revisions to protect project quality and momentum.\n\nPlease check the attached SOW and confirm your designated design sign-off contact so we can commence Sprint 1 immediately.\n\nBest regards,\nDesign Studio Team",
  },
  demoMode: true,
};

export const PROPOSAL_PRESET_4: ScopeProposal = {
  projectTitle: "Auth Hardening, Enterprise RBAC & Security Expansion",
  clientSummary:
    "Comprehensive security and access control expansion for existing SaaS application. Implements enterprise-grade social authentication, fine-grained role-based access control (RBAC), multi-factor authentication (SMS + TOTP), and immutable CSV audit logging.",
  detectedTraps: [
    "Minimization trap 'quickly squeeze in' multi-day enterprise security architecture",
    "Assumption that RBAC is 'trivial' because base auth is in progress",
    "Open-ended 'etc.' and casually suggested 8-language localization scope leak",
    "Client attempting to maintain unchanged deadline and budget despite 4 major feature additions",
  ],
  milestones: [
    {
      id: "phase-01",
      phase: "Phase 01",
      title: "Security Architecture & RBAC Schema Design",
      deliverables: [
        {
          id: "d-4101",
          name: "Multi-Provider OAuth 2.0 / OIDC Architecture Blueprint",
          hours: 14,
          complexity: "Med",
          included: true,
        },
        {
          id: "d-4102",
          name: "Hierarchical RBAC Permission Matrix & Database Modeling",
          hours: 18,
          complexity: "High",
          included: true,
        },
        {
          id: "d-4103",
          name: "MFA State Machine & Recovery Code Cryptographic Architecture",
          hours: 16,
          complexity: "High",
          included: true,
        },
      ],
      phaseTotalHours: 48,
    },
    {
      id: "phase-02",
      phase: "Phase 02",
      title: "Core Security Build, MFA & Audit Engine",
      deliverables: [
        {
          id: "d-4201",
          name: "5-Provider Social Login Suite (Google, Apple, GitHub, Twitter, LinkedIn)",
          hours: 22,
          complexity: "Med",
          included: true,
        },
        {
          id: "d-4202",
          name: "Dynamic Role & Permission Management UI for Tenant Admins",
          hours: 20,
          complexity: "High",
          included: true,
        },
        {
          id: "d-4203",
          name: "Two-Factor Authentication Flow (TOTP Authenticator + SMS Fallback)",
          hours: 24,
          complexity: "High",
          included: true,
        },
        {
          id: "d-4204",
          name: "Security Audit Event Logging Middleware & CSV Export Engine",
          hours: 16,
          complexity: "Med",
          included: true,
        },
      ],
      phaseTotalHours: 82,
    },
    {
      id: "phase-03",
      phase: "Phase 03",
      title: "Security Penetration QA, Compliance & Delivery",
      deliverables: [
        {
          id: "d-4301",
          name: "Session Hijacking, CSRF, and Privilege Escalation Security Audit",
          hours: 18,
          complexity: "High",
          included: true,
        },
        {
          id: "d-4302",
          name: "Automated Integration Test Suite for All Auth Combinations",
          hours: 14,
          complexity: "Med",
          included: true,
        },
        {
          id: "d-4303",
          name: "Production Migration Script for Existing User Accounts",
          hours: 12,
          complexity: "Med",
          included: true,
        },
        {
          id: "d-4304",
          name: "Security Architecture Compliance Documentation & Admin Runbook",
          hours: 8,
          complexity: "Low",
          included: true,
        },
      ],
      phaseTotalHours: 52,
    },
  ],
  outOfScope: [
    "Multi-language localization for 8 languages (slated for separate Q3 internationalization SOW)",
    "Third-party SMS delivery gateway carrier fees (Twilio/AWS SNS billed directly to client)",
    "Enterprise SAML/SSO federation (Okta, Azure AD, PingIdentity)",
    "Hardware security key (WebAuthn/FIDO2) integration",
    "Custom compliance certifications (HIPAA, PCI-DSS Level 1 audit filings)",
  ],
  assumptions: [
    "Client will provide developer credentials for Google, Apple, GitHub, Twitter, and LinkedIn apps",
    "SMS gateway (Twilio) account will be set up and funded by the client",
    "Existing user database schema will be made accessible for migration script development",
  ],
  discoveryQuestions: [
    "What SMS gateway provider does your organization currently utilize for transactional alerts?",
    "How many predefined default roles (e.g. Owner, Admin, Member, Viewer) do you require?",
    "Do you need audit logs to be immutable (e.g., appended to write-once cloud storage)?",
    "What is your target timeline for the internationalization expansion mentioned for next week?",
  ],
  recommendedReplyEmail: {
    subject: "Scope Assessment: Authentication Expansion & RBAC Architecture",
    body: "Hi team,\n\nThanks for detailing the follow-up requirements! Social auth, granular RBAC, 2FA, and audit logging are fantastic enterprise additions that will significantly elevate your product security.\n\nBecause these additions encompass substantial cryptographic, database, and UI workflows, they represent a formal security expansion milestone rather than minor tweaks. We have organized them into a structured Statement of Work to guarantee zero security regressions in your live auth pipeline.\n\nPlease review the attached scope and 4 brief discovery questions so we can schedule this sprint effectively.\n\nBest regards,\nSecurity Engineering Team",
  },
  demoMode: true,
};

// Default authoritative proposal dataset (Preset 1)
export const DEFAULT_PROPOSAL: ScopeProposal = PROPOSAL_PRESET_1;
export const SAMPLE_SCOPE_PROPOSAL: ScopeProposal = PROPOSAL_PRESET_1;
