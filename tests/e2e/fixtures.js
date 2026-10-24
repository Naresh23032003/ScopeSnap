/**
 * tests/e2e/fixtures.js
 * Authoritative test fixtures, presets, schemas, and reference constants for ScopeSnap.
 * Strict compliance: Zero em dashes (U+2014) throughout.
 */

// 1. Currency & Hourly Rate Configurations
export const CURRENCY_CONFIGS = {
  USD: { symbol: '$', code: 'USD', minRate: 25, maxRate: 250, defaultRate: 100, step: 5 },
  INR: { symbol: '\u20B9', code: 'INR', minRate: 1500, maxRate: 15000, defaultRate: 5000, step: 500 },
  EUR: { symbol: '\u20AC', code: 'EUR', minRate: 25, maxRate: 250, defaultRate: 90, step: 5 },
  GBP: { symbol: '\u00A3', code: 'GBP', minRate: 20, maxRate: 200, defaultRate: 80, step: 5 },
};

// 2. Risk Buffer Multipliers
export const RISK_BUFFERS = {
  STANDARD: { key: '1.0x', multiplier: 1.0, label: 'Clean Scope (0% Buffer)' },
  GUARDED: { key: '+15%', multiplier: 1.15, label: 'Moderate Ambiguity (+15% Buffer)' },
  IRONCLAD: { key: '+35%', multiplier: 1.35, label: 'High Client Chaos (+35% Buffer)' },
};

// 3. Payment Schedules
export const PAYMENT_SCHEDULES = ['50/50', '40/30/30', 'retainer'];

// 4. Vague Phrase Warning Scanner Regex Catalog (10 core patterns)
export const VAGUE_PHRASE_PATTERNS = [
  {
    id: 'simple',
    phrase: 'simple',
    regex: /\b(simple|super\s+simple)\b/gi,
    category: 'Ambiguity',
    riskExplanation: 'Subjective complexity trap. Simple features usually hide massive backend edge cases.'
  },
  {
    id: 'quick',
    phrase: 'quick',
    regex: /\b(quick|quickly)\b/gi,
    category: 'Timeline',
    riskExplanation: 'Timeline compression hazard. Diminishes architectural planning and test cycles.'
  },
  {
    id: 'maybe_later',
    phrase: 'maybe later',
    regex: /\b(maybe\s+later|down\s+the\s+road)\b/gi,
    category: 'Scope Creep',
    riskExplanation: 'Uncommitted boundary. Requires immediate architectural accommodation without payment.'
  },
  {
    id: 'asap',
    phrase: 'ASAP',
    regex: /\b(ASAP|as\s+soon\s+as\s+possible)\b/gi,
    category: 'Rush Hazard',
    riskExplanation: 'Emergency urgency lacking milestone definition; triggers standard rush premium.'
  },
  {
    id: 'etc',
    phrase: 'etc.',
    regex: /\b(etc\.?|and\s+so\s+on)\b/gi,
    category: 'Open-Ended',
    riskExplanation: 'Infinite scope leak. Etc. allows clients to inject unbilled additions indefinitely.'
  },
  {
    id: 'similar_to_uber',
    phrase: 'similar to Uber/Airbnb',
    regex: /\b(similar\s+to|like)\s+(uber|airbnb|amazon|netflix|twitter|facebook|notion)\b/gi,
    category: 'Anchoring',
    riskExplanation: 'Multi-billion dollar platform comparison. Extreme distortion of MVP scope.'
  },
  {
    id: 'unlimited',
    phrase: 'unlimited',
    regex: /\b(unlimited)\b/gi,
    category: 'Liability',
    riskExplanation: 'Infinite liability trap (unlimited revisions, variants, or server queries).'
  },
  {
    id: 'just',
    phrase: 'just',
    regex: /\bjust\s+(hook\s+up|add|build|make|tweak|change|do|squeeze\s+in)\b/gi,
    category: 'Minimization',
    riskExplanation: 'Minimization phrasing. Masks multi-day engineering effort as trivial tweaks.'
  },
  {
    id: 'few_hours',
    phrase: 'a few hours',
    regex: /\b(a\s+few\s+hours|couple\s+of\s+hours|trivial)\b/gi,
    category: 'Price Anchor',
    riskExplanation: 'Client anchoring trap attempting to pre-determine senior engineering hours.'
  },
  {
    id: 'unlimited_revisions',
    phrase: 'unlimited revisions',
    regex: /\bunlimited\s+revisions?\b/gi,
    category: 'Fatal Creep',
    riskExplanation: 'Agency profit killer. SOW must strictly limit revisions to 2 formalized rounds.'
  }
];

// 5. Realistic Client Chaos Presets
export const CLIENT_CHAOS_PRESETS = [
  {
    id: 'preset-1',
    category: 'E-Commerce & Retail',
    label: 'E-Commerce Rebuild Dump',
    subtitle: 'Shopify to Custom Next.js Migration',
    badge: 'High Complexity',
    rawText: `Hey team! We need to rebuild our current Shopify store into a custom modern web app. It needs to be super simple and quick, ideally live in 2 weeks ASAP. We want something similar to Uber/Airbnb where users can book custom delivery slots, plus unlimited product variants. Also maybe later we will add AI recommendations, a multi-vendor marketplace, and custom mobile apps for iOS and Android, etc. Our current site has around 5,000 SKUs. We also need custom ERP integration and a blazing fast search engine. Budget is tight but we have lots of follow-up work!`
  },
  {
    id: 'preset-2',
    category: 'AI & B2B SaaS',
    label: 'AI SaaS MVP Call Notes',
    subtitle: 'Voice Transcript / Raw Meeting Dump',
    badge: 'Architecture Risk',
    rawText: `Client call notes with Dave (Founder):
- Wants a B2B AI document analysis platform like Notion AI meets ChatPDF.
- Needs PDF upload, semantic chunking, vector database (Pinecone or pgvector), and Groq or OpenAI streaming.
- Said: "Should be quick, just hook up some APIs, right? Maybe later we add Slack bot, team seats, Stripe billing with usage metering, and SOC2 compliance."
- Must support 500-page financial PDFs without crashing.
- Wants an admin dashboard for token usage tracking.
- Launch target: end of next month.
- Client asked: "Can we do unlimited queries for early beta testers?" (Major cost trap!)`
  },
  {
    id: 'preset-3',
    category: 'Design & Marketing',
    label: 'Urgent Landing Page + Branding',
    subtitle: 'High-Pressure Agency Sprint',
    badge: 'Urgent Sprint',
    rawText: `From Slack:
"Need a high-converting 5-page landing page + brand refresh by Friday ASAP! Full 3D interactive splines, custom illustrations, responsive for all devices, dark/light mode toggle. We also need custom email templates, pitch deck design, and SEO optimization. Don't worry about copy, we will write it later (or just use lorem ipsum for now, but design must fit perfectly). We want unlimited revisions until the board signs off. It's a quick simple project, should take a few hours for a senior dev."`
  },
  {
    id: 'preset-4',
    category: 'Expansion Creep',
    label: 'Scope Creep Follow-up Email',
    subtitle: 'Post-Kickoff Expansion Trap',
    badge: 'Creep Hazard',
    rawText: `Hi team, just following up on our kickoff! While you're building the core auth and user profile pages, could we also quickly squeeze in:
1. Social logins (Google, Apple, GitHub, Twitter, LinkedIn)
2. Role-based access control with custom permission matrices
3. Two-factor authentication (SMS + Authenticator app)
4. Activity audit logs exportable to CSV
Should be trivial since auth is already in progress, right? We won't need to adjust the deadline or budget for these minor tweaks. Also etc., let's discuss adding localization for 8 languages next week.`
  }
];

// 6. Complete Sample Scope Proposal (authoritative fixture matching ScopeProposalSchema)
export const SAMPLE_SCOPE_PROPOSAL = {
  projectTitle: 'Next.js Custom E-Commerce Platform Rebuild',
  clientSummary: 'Migration from legacy Shopify store with 5,000 SKUs to a high-speed headless Next.js commerce architecture. Scope covers core catalog, delivery slot booking engine, and secure checkout while establishing explicit boundaries against unbudgeted multi-vendor marketplace and native mobile app creep.',
  detectedTraps: [
    "Vague 'simple and quick' 2-week deadline for complex 5,000 SKU migration",
    "Anchoring to 'Uber/Airbnb' delivery slot reservation engine without backend fleet schema",
    "Unbounded 'unlimited product variants' risking database index bloat",
    "Casual mention of 'maybe later' AI recommendations, multi-vendor marketplace, and native mobile apps",
    'Undefined custom ERP integration scope and authentication protocols'
  ],
  milestones: [
    {
      id: 'phase-01',
      phase: 'Phase 01',
      title: 'Architecture, Data Schema & Discovery',
      deliverables: [
        { id: 'd-101', name: 'Headless Commerce Architecture & Next.js App Router Blueprint', hours: 16, complexity: 'Med', included: true },
        { id: 'd-102', name: '5,000 SKU Catalog Data Schema & PostgreSQL / Prisma Modeling', hours: 20, complexity: 'High', included: true },
        { id: 'd-103', name: 'Custom Delivery Slot Booking State Machine & Schedule Architecture', hours: 18, complexity: 'High', included: true },
        { id: 'd-104', name: 'Interactive High-Fidelity Design Tokens & Component System', hours: 14, complexity: 'Med', included: true }
      ],
      phaseTotalHours: 68
    },
    {
      id: 'phase-02',
      phase: 'Phase 02',
      title: 'Core Build, Delivery Engine & Integrations',
      deliverables: [
        { id: 'd-201', name: 'High-Performance Product Catalog & Dynamic Variant Selector', hours: 24, complexity: 'Med', included: true },
        { id: 'd-202', name: 'Delivery Slot Calendar & Real-Time Availability Lock Engine', hours: 28, complexity: 'High', included: true },
        { id: 'd-203', name: 'Stripe Elements Payment Checkout & Order Fulfillment Webhooks', hours: 18, complexity: 'Med', included: true },
        { id: 'd-204', name: 'Transactional Notification System (Email + Order Confirmation)', hours: 12, complexity: 'Low', included: true }
      ],
      phaseTotalHours: 82
    },
    {
      id: 'phase-03',
      phase: 'Phase 03',
      title: 'Hardening, Data Migration, QA & Launch',
      deliverables: [
        { id: 'd-301', name: 'Shopify CSV to PostgreSQL Catalog Migration & Validation Script', hours: 22, complexity: 'High', included: true },
        { id: 'd-302', name: 'End-to-End Cypress / Playwright Checkout & Booking Test Suite', hours: 16, complexity: 'Med', included: true },
        { id: 'd-303', name: 'Vercel Enterprise Edge Deployment, Domain DNS & SSL Cutover', hours: 10, complexity: 'Low', included: true },
        { id: 'd-304', name: 'Admin Training Handoff & Technical SOW Sign-off Documentation', hours: 8, complexity: 'Low', included: true }
      ],
      phaseTotalHours: 56
    }
  ],
  outOfScope: [
    'Native iOS and Android mobile app development (PWA supported only)',
    'Multi-vendor marketplace infrastructure and seller split-payment payouts',
    'AI-powered predictive recommendation engine (slated for Phase 2 roadmap)',
    'Custom legacy ERP synchronization beyond standard REST/JSON webhooks',
    'Uncapped design revision rounds (strictly capped at 2 consolidated cycles)',
    'Third-party API licensing, SMS carrier fees, and hosting subscription costs'
  ],
  assumptions: [
    'Client will provide clean, exported Shopify CSV product catalog and imagery assets prior to Sprint 1',
    'Delivery geographic boundaries are restricted to pre-defined postal code matrices',
    'Standard Stripe account will be provisioned by client with verified merchant credentials'
  ],
  discoveryQuestions: [
    'Which specific ERP software are you using, and does it provide a documented REST API with webhook support?',
    'How are your delivery vehicle capacities currently constrained (by order weight, total volume, or driver shift)?',
    'What is your target peak concurrent order volume during launch week?',
    'Who on your team is authorized to provide final approval on design deliverables?'
  ],
  recommendedReplyEmail: {
    subject: 'Proposal & Technical Scope: Custom Next.js E-Commerce Rebuild',
    body: 'Hi Dave,\n\nThanks for sharing the vision for the store rebuild! We have analyzed the requirements and structured an actionable, phased Statement of Work designed to launch your high-performance Next.js custom store without risking technical debt.\n\nTo ensure rapid delivery, we have prioritized the core storefront, 5,000 SKU catalog migration, and custom delivery slot booking engine in Phase 1. Advanced features such as multi-vendor marketplace architecture and native mobile apps are cleanly scheduled for Phase 2.\n\nBefore we finalize kickoff, could you review the 4 brief discovery questions in the attached SOW regarding your ERP and delivery parameters?\n\nLooking forward to building this together!\n\nBest regards,\nEngineering Team'
  },
  demoMode: true
};

// 7. Tactical Obsidian Theme Palette Hex Values
export const OBSIDIAN_PALETTE = {
  bgCanvas: '#07080A',
  bgPanel: '#0D0F14',
  bgControl: '#13161E',
  bgGlass: 'rgba(15, 18, 25, 0.78)',
  accentPrimary: '#10B981',
  accentWarning: '#F59E0B',
  accentDanger: '#F43F5E',
  accentTelemetry: '#06B6D4',
  paperBg: '#FAF9F6',
  paperText: '#111827'
};

// 8. 3D Icosahedron Geometry Reference (12 vertices, 30 edges)
export function getIcosahedronGeometry() {
  const phi = (1 + Math.sqrt(5)) / 2; // Golden ratio ~1.6180339887
  const vertices = [
    [-1,  phi, 0],
    [ 1,  phi, 0],
    [-1, -phi, 0],
    [ 1, -phi, 0],
    [0, -1,  phi],
    [0,  1,  phi],
    [0, -1, -phi],
    [0,  1, -phi],
    [ phi, 0, -1],
    [ phi, 0,  1],
    [-phi, 0, -1],
    [-phi, 0,  1],
  ];

  // Normalize vertices to unit sphere
  const normalizedVertices = vertices.map(v => {
    const len = Math.hypot(v[0], v[1], v[2]);
    return [v[0] / len, v[1] / len, v[2] / len];
  });

  const edges = [
    [0, 11], [0, 5], [0, 1], [0, 7], [0, 10],
    [1, 5], [5, 11], [11, 10], [10, 7], [7, 1],
    [3, 9], [3, 4], [3, 2], [3, 6], [3, 8],
    [4, 9], [2, 4], [6, 2], [8, 6], [9, 8],
    [4, 5], [5, 9], [8, 1], [1, 9], [7, 8],
    [6, 7], [10, 6], [2, 10], [11, 2], [4, 11]
  ];

  return { vertices: normalizedVertices, edges };
}
