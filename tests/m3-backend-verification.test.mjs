/**
 * tests/m3-backend-verification.test.mjs
 * Direct automated verification test suite for Milestone M3 Backend modules:
 * - lib/types.ts
 * - lib/constants.ts
 * - lib/calculations.ts
 * - lib/groq.ts
 *
 * Strict constraint: Zero em dashes (U+2014) anywhere in code or console outputs.
 */

import assert from "node:assert";
import {
  GenerateScopeRequestSchema,
  DeliverableSchema,
  MilestonePhaseSchema,
  ScopeProposalSchema,
} from "../lib/types.js";
import {
  CURRENCY_CONFIGS,
  RISK_BUFFERS,
  PAYMENT_SCHEDULES,
  VAGUE_PHRASE_PATTERNS,
  CLIENT_CHAOS_PRESETS,
  DEFAULT_PROPOSAL,
  PROPOSAL_PRESET_1,
  PROPOSAL_PRESET_2,
  PROPOSAL_PRESET_3,
  PROPOSAL_PRESET_4,
} from "../lib/constants.js";
import {
  calculateBaseHours,
  calculateBillableHours,
  calculateTotalInvestment,
  calculateTimeline,
  calculateConfidenceScore,
  calculatePaymentSplit,
  scanVaguePhrases,
  countHighComplexityDeliverables,
  recalculateProposal,
} from "../lib/calculations.js";
import {
  GROQ_SYSTEM_PROMPT,
  buildUserPrompt,
  generateDemoScope,
} from "../lib/groq.js";

console.log("======================================================================");
console.log("  ScopeSnap : Milestone M3 Backend Verification Test Suite");
console.log("======================================================================\n");

let passed = 0;
let failed = 0;

function it(name, fn) {
  try {
    fn();
    console.log(`  ✓ PASS ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ FAIL ${name}:`, err.message);
    failed++;
  }
}

async function itAsync(name, fn) {
  try {
    await fn();
    console.log(`  ✓ PASS ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ FAIL ${name}:`, err.message);
    failed++;
  }
}

// -----------------------------------------------------------------------------
// 1. Types & Zod Schemas
// -----------------------------------------------------------------------------
console.log("--- Suite 1: Types & Zod Schemas ---");

it("T1.1: GenerateScopeRequestSchema accepts valid request", () => {
  const valid = GenerateScopeRequestSchema.parse({
    rawNotes: "Valid client scope note string containing enough details.",
    currency: "USD",
    hourlyRate: 125,
  });
  assert.strictEqual(valid.currency, "USD");
  assert.strictEqual(valid.hourlyRate, 125);
  assert.strictEqual(valid.projectType, "Web Application");
});

it("T1.2: GenerateScopeRequestSchema rejects notes shorter than 10 characters", () => {
  assert.throws(() => {
    GenerateScopeRequestSchema.parse({ rawNotes: "Too short" });
  });
});

it("T1.3: ScopeProposalSchema validates authoritative DEFAULT_PROPOSAL", () => {
  const result = ScopeProposalSchema.safeParse(DEFAULT_PROPOSAL);
  assert.strictEqual(result.success, true);
});

it("T1.4: ScopeProposalSchema rejects proposals without exactly 3 phases", () => {
  const invalid = {
    ...DEFAULT_PROPOSAL,
    milestones: DEFAULT_PROPOSAL.milestones.slice(0, 2),
  };
  const result = ScopeProposalSchema.safeParse(invalid);
  assert.strictEqual(result.success, false);
});

// -----------------------------------------------------------------------------
// 2. Constants & Presets
// -----------------------------------------------------------------------------
console.log("\n--- Suite 2: Constants & Presets ---");

it("C2.1: 4 currencies configured with required properties", () => {
  const keys = Object.keys(CURRENCY_CONFIGS);
  assert.deepStrictEqual(keys.sort(), ["EUR", "GBP", "INR", "USD"]);
  assert.strictEqual(CURRENCY_CONFIGS.USD.symbol, "$");
  assert.strictEqual(CURRENCY_CONFIGS.INR.symbol, "\u20B9");
  assert.strictEqual(CURRENCY_CONFIGS.EUR.symbol, "\u20AC");
  assert.strictEqual(CURRENCY_CONFIGS.GBP.symbol, "\u00A3");
});

it("C2.2: 10 vague phrase scanner regexes defined and non-empty", () => {
  assert.strictEqual(VAGUE_PHRASE_PATTERNS.length, 10);
  for (const p of VAGUE_PHRASE_PATTERNS) {
    assert.ok(p.id && p.phrase && p.regex && p.category && p.riskExplanation);
  }
});

it("C2.3: 4 Client Chaos presets defined and contain expected triggers", () => {
  assert.strictEqual(CLIENT_CHAOS_PRESETS.length, 4);
  assert.ok(CLIENT_CHAOS_PRESETS[0].rawText.includes("Shopify"));
  assert.ok(CLIENT_CHAOS_PRESETS[1].rawText.includes("Pinecone"));
  assert.ok(CLIENT_CHAOS_PRESETS[2].rawText.includes("ASAP"));
  assert.ok(CLIENT_CHAOS_PRESETS[3].rawText.includes("squeeze in"));
});

it("C2.4: All 4 rich fallback proposals pass ScopeProposalSchema validation", () => {
  assert.ok(ScopeProposalSchema.safeParse(PROPOSAL_PRESET_1).success);
  assert.ok(ScopeProposalSchema.safeParse(PROPOSAL_PRESET_2).success);
  assert.ok(ScopeProposalSchema.safeParse(PROPOSAL_PRESET_3).success);
  assert.ok(ScopeProposalSchema.safeParse(PROPOSAL_PRESET_4).success);
});

// -----------------------------------------------------------------------------
// 3. Real-Time Calculation Engine
// -----------------------------------------------------------------------------
console.log("\n--- Suite 3: Calculations Engine ---");

it("M3.1: calculateBaseHours sums included deliverables correctly", () => {
  const base = calculateBaseHours(DEFAULT_PROPOSAL.milestones);
  assert.strictEqual(base, 206);
});

it("M3.2: calculateBillableHours applies risk buffer accurately", () => {
  assert.strictEqual(calculateBillableHours(206, 1.0), 206);
  assert.strictEqual(calculateBillableHours(206, 1.15), 237);
  assert.strictEqual(calculateBillableHours(206, 1.35), 278);
});

it("M3.3: calculateTotalInvestment multiplies billable hours by rate", () => {
  assert.strictEqual(calculateTotalInvestment(237, 100), 23700);
  assert.strictEqual(calculateTotalInvestment(278, 125), 34750);
});

it("M3.4: calculateTimeline estimates weeks and days", () => {
  const t = calculateTimeline(237);
  assert.strictEqual(t.totalWeeks, 10);
  assert.strictEqual(t.totalDays, 48);
});

it("M3.5: calculateConfidenceScore clamps within [45, 98]", () => {
  const normal = calculateConfidenceScore({ trapCount: 2, riskBuffer: 1.15, highComplexityCount: 1 });
  assert.ok(normal >= 45 && normal <= 98);
  const severe = calculateConfidenceScore({ trapCount: 20, riskBuffer: 1.0, highComplexityCount: 10 });
  assert.strictEqual(severe, 45);
  const clean = calculateConfidenceScore({ trapCount: 0, riskBuffer: 1.35, highComplexityCount: 0 });
  assert.strictEqual(clean, 98);
});

it("M3.6: calculatePaymentSplit conserves total for 50/50, 40/30/30, and retainer", () => {
  const total = 9873;
  const s50 = calculatePaymentSplit(total, "50/50");
  assert.strictEqual(s50.total, total);
  assert.strictEqual(s50.items[0].amount + s50.items[1].amount, total);

  const s40 = calculatePaymentSplit(total, "40/30/30");
  assert.strictEqual(s40.total, total);
  assert.strictEqual(s40.items[0].amount + s40.items[1].amount + s40.items[2].amount, total);

  const sRet = calculatePaymentSplit(total, "retainer", 12);
  assert.strictEqual(sRet.total, total);
});

it("M3.7: scanVaguePhrases detects multiple traps accurately", () => {
  const scan = scanVaguePhrases("Need a super simple and quick app similar to Uber ASAP etc.");
  assert.ok(scan.totalTrapCount >= 4);
  assert.ok(scan.matches.some((m) => m.id === "simple"));
  assert.ok(scan.matches.some((m) => m.id === "quick"));
  assert.ok(scan.matches.some((m) => m.id === "similar_to_uber"));
  assert.ok(scan.matches.some((m) => m.id === "asap"));
  assert.ok(scan.matches.some((m) => m.id === "etc"));
});

it("M3.8: recalculateProposal links entire calculation pipeline", () => {
  const settings = {
    currency: "USD",
    hourlyRate: 110,
    riskBuffer: 1.15,
    paymentSchedule: "40/30/30",
  };
  const result = recalculateProposal(DEFAULT_PROPOSAL.milestones, settings, 3);
  assert.strictEqual(result.baseHours, 206);
  assert.strictEqual(result.billableHours, 237);
  assert.strictEqual(result.totalInvestment, 237 * 110);
  assert.strictEqual(result.paymentSplit.total, 237 * 110);
});

// -----------------------------------------------------------------------------
// 4. Groq Integration & Fallback Engine
// -----------------------------------------------------------------------------
console.log("\n--- Suite 4: Groq & Fallback Engine ---");

it("G4.1: GROQ_SYSTEM_PROMPT contains zero em dashes (U+2014)", () => {
  assert.strictEqual(/\u2014/.test(GROQ_SYSTEM_PROMPT), false);
});

it("G4.2: buildUserPrompt formats prompt cleanly without em dashes", () => {
  const prompt = buildUserPrompt({
    rawNotes: "Test client requirements",
    currency: "EUR",
    hourlyRate: 90,
  });
  assert.ok(prompt.includes("PROJECT TYPE:"));
  assert.ok(prompt.includes("TARGET CURRENCY: EUR"));
  assert.ok(prompt.includes("TARGET BASE HOURLY RATE: 90"));
  assert.strictEqual(/\u2014/.test(prompt), false);
});

await itAsync("G4.3: generateDemoScope returns valid proposal with ~320ms simulated delay and demoMode: true", async () => {
  const t0 = Date.now();
  const demo = await generateDemoScope("Shopify store rebuild with 5,000 SKUs", "USD", 100);
  const elapsed = Date.now() - t0;

  assert.ok(elapsed >= 300, `Expected delay >= 300ms, got ${elapsed}ms`);
  assert.strictEqual(demo.demoMode, true);
  assert.strictEqual(demo.milestones.length, 3);
  assert.ok(demo.outOfScope.length >= 4);

  // Validate schema
  const validation = ScopeProposalSchema.safeParse(demo);
  assert.strictEqual(validation.success, true);
});

await itAsync("G4.4: generateDemoScope selects context-aware preset based on notes content", async () => {
  const aiScope = await generateDemoScope("We want a B2B AI platform with vector database and PDF document upload");
  assert.strictEqual(aiScope.projectTitle, PROPOSAL_PRESET_2.projectTitle);

  const landingScope = await generateDemoScope("Urgent landing page and brand refresh by Friday ASAP with pitch deck");
  assert.strictEqual(landingScope.projectTitle, PROPOSAL_PRESET_3.projectTitle);

  const authScope = await generateDemoScope("Could we quickly squeeze in social logins, RBAC and 2FA authentication");
  assert.strictEqual(authScope.projectTitle, PROPOSAL_PRESET_4.projectTitle);
});

console.log("\n======================================================================");
console.log(`  Summary: ${passed} PASSED, ${failed} FAILED`);
console.log("======================================================================\n");

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
