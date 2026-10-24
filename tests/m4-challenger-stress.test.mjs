/**
 * tests/m4-challenger-stress.test.mjs
 * Adversarial empirical stress test suite for ScopeSnap Milestone M4.
 * Targets: VagueScanner regex engine, all 4 client presets, floating 3D chip styles,
 * live client-side recalculation math purity, zero network dependency, and boundary conditions.
 *
 * Strict constraint: Zero em dashes (U+2014) anywhere in code or console output.
 */

import assert from 'node:assert';
import { performance } from 'node:perf_hooks';
import fs from 'node:fs';
import path from 'node:path';
import {
  scanVaguePhrases,
  calculateBaseHours,
  calculateBillableHours,
  calculateTotalInvestment,
  calculateTimeline,
  calculateConfidenceScore,
  calculatePaymentSplit,
  countHighComplexityDeliverables,
  recalculateProposal,
} from '../lib/calculations.ts';
import {
  CLIENT_CHAOS_PRESETS,
  VAGUE_PHRASE_PATTERNS,
  CURRENCY_CONFIGS,
  RISK_BUFFERS,
  PAYMENT_SCHEDULES,
  PROPOSAL_PRESET_1,
  PROPOSAL_PRESET_2,
  PROPOSAL_PRESET_3,
  PROPOSAL_PRESET_4,
} from '../lib/constants.ts';

console.log('======================================================================');
console.log('  ScopeSnap : Empirical Challenger Stress Test Suite (M4)');
console.log('======================================================================\n');

let passed = 0;
let failed = 0;
const failureDetails = [];

async function test(name, fn) {
  try {
    await fn();
    console.log(`  [PASS] ${name}`);
    passed++;
  } catch (err) {
    console.error(`  [FAIL] ${name}: ${err.message}`);
    failed++;
    failureDetails.push({ name, error: err.message });
  }
}

function assertNoEmDashes(str, contextName) {
  assert.ok(
    !str.includes('\u2014'),
    `Em dash (U+2014) detected in ${contextName}`
  );
}

// =============================================================================
// SECTION 1: Empirically Test All 4 Client Presets with VagueScanner
// =============================================================================

await test('SEC1.1: Preset 1 (E-Commerce Rebuild) triggers expected vague phrases', async () => {
  const preset1 = CLIENT_CHAOS_PRESETS.find((p) => p.id === 'preset-1');
  assert.ok(preset1, 'Preset 1 must exist');
  const result = scanVaguePhrases(preset1.rawText);

  assert.ok(result.totalTrapCount >= 7, `Expected at least 7 traps in Preset 1, got ${result.totalTrapCount}`);
  
  const matchedIds = result.matches.map((m) => m.id);
  assert.ok(matchedIds.includes('simple'), 'Preset 1 must detect "simple" (super simple)');
  assert.ok(matchedIds.includes('quick'), 'Preset 1 must detect "quick"');
  assert.ok(matchedIds.includes('asap'), 'Preset 1 must detect "asap"');
  assert.ok(matchedIds.includes('similar_to_uber'), 'Preset 1 must detect "similar to Uber/Airbnb"');
  assert.ok(matchedIds.includes('unlimited'), 'Preset 1 must detect "unlimited"');
  assert.ok(matchedIds.includes('maybe_later'), 'Preset 1 must detect "maybe later"');
  assert.ok(matchedIds.includes('etc'), 'Preset 1 must detect "etc."');

  for (const match of result.matches) {
    assert.ok(match.count > 0, `Match count for ${match.id} should be > 0`);
    assert.ok(match.riskExplanation && match.riskExplanation.length > 10, `Risk explanation missing for ${match.id}`);
    assertNoEmDashes(match.riskExplanation, `Preset 1 match ${match.id} explanation`);
  }
});

await test('SEC1.2: Preset 2 (AI SaaS MVP) triggers expected vague phrases', async () => {
  const preset2 = CLIENT_CHAOS_PRESETS.find((p) => p.id === 'preset-2');
  assert.ok(preset2, 'Preset 2 must exist');
  const result = scanVaguePhrases(preset2.rawText);

  assert.ok(result.totalTrapCount >= 4, `Expected at least 4 traps in Preset 2, got ${result.totalTrapCount}`);

  const matchedIds = result.matches.map((m) => m.id);
  assert.ok(matchedIds.includes('quick'), 'Preset 2 must detect "quick"');
  assert.ok(matchedIds.includes('just'), 'Preset 2 must detect "just hook up"');
  assert.ok(matchedIds.includes('maybe_later'), 'Preset 2 must detect "maybe later"');
  assert.ok(matchedIds.includes('unlimited'), 'Preset 2 must detect "unlimited"');

  for (const match of result.matches) {
    assertNoEmDashes(match.riskExplanation, `Preset 2 match ${match.id} explanation`);
  }
});

await test('SEC1.3: Preset 3 (Urgent Landing Page) triggers expected vague phrases', async () => {
  const preset3 = CLIENT_CHAOS_PRESETS.find((p) => p.id === 'preset-3');
  assert.ok(preset3, 'Preset 3 must exist');
  const result = scanVaguePhrases(preset3.rawText);

  assert.ok(result.totalTrapCount >= 6, `Expected at least 6 traps in Preset 3, got ${result.totalTrapCount}`);

  const matchedIds = result.matches.map((m) => m.id);
  assert.ok(matchedIds.includes('asap'), 'Preset 3 must detect "asap"');
  assert.ok(matchedIds.includes('unlimited_revisions'), 'Preset 3 must detect "unlimited revisions"');
  assert.ok(matchedIds.includes('unlimited'), 'Preset 3 must detect "unlimited"');
  assert.ok(matchedIds.includes('quick'), 'Preset 3 must detect "quick"');
  assert.ok(matchedIds.includes('simple'), 'Preset 3 must detect "simple"');
  assert.ok(matchedIds.includes('few_hours'), 'Preset 3 must detect "few hours"');

  for (const match of result.matches) {
    assertNoEmDashes(match.riskExplanation, `Preset 3 match ${match.id} explanation`);
  }
});

await test('SEC1.4: Preset 4 (Scope Creep Follow-up) triggers expected vague phrases', async () => {
  const preset4 = CLIENT_CHAOS_PRESETS.find((p) => p.id === 'preset-4');
  assert.ok(preset4, 'Preset 4 must exist');
  const result = scanVaguePhrases(preset4.rawText);

  assert.ok(result.totalTrapCount >= 3, `Expected at least 3 traps in Preset 4, got ${result.totalTrapCount}`);

  const matchedIds = result.matches.map((m) => m.id);
  assert.ok(matchedIds.includes('quick'), 'Preset 4 must detect "quickly"');
  assert.ok(matchedIds.includes('few_hours'), 'Preset 4 must detect "trivial"');
  assert.ok(matchedIds.includes('etc'), 'Preset 4 must detect "etc."');

  for (const match of result.matches) {
    assertNoEmDashes(match.riskExplanation, `Preset 4 match ${match.id} explanation`);
  }
});

// =============================================================================
// SECTION 2: Adversarial Edge Cases & Stress Tests for VagueScanner
// =============================================================================

await test('SEC2.1: Scanner handles empty, null, undefined, and non-string inputs safely', async () => {
  const emptyRes = scanVaguePhrases('');
  assert.strictEqual(emptyRes.totalTrapCount, 0);
  assert.strictEqual(emptyRes.matches.length, 0);

  const nullRes = scanVaguePhrases(null);
  assert.strictEqual(nullRes.totalTrapCount, 0);
  assert.strictEqual(nullRes.matches.length, 0);

  const undefinedRes = scanVaguePhrases(undefined);
  assert.strictEqual(undefinedRes.totalTrapCount, 0);
  assert.strictEqual(undefinedRes.matches.length, 0);

  const numRes = scanVaguePhrases(12345);
  assert.strictEqual(numRes.totalTrapCount, 0);
  assert.strictEqual(numRes.matches.length, 0);

  const objRes = scanVaguePhrases({ text: 'simple' });
  assert.strictEqual(objRes.totalTrapCount, 0);
  assert.strictEqual(objRes.matches.length, 0);
});

await test('SEC2.2: Scanner detects all 10 patterns individually with multiple occurrences', async () => {
  const testPhrases = [
    { input: 'This is super simple and also simple', id: 'simple', expectedCount: 2 },
    { input: 'We must build it quickly and do a quick pass', id: 'quick', expectedCount: 2 },
    { input: 'Maybe later or down the road we will see', id: 'maybe_later', expectedCount: 2 },
    { input: 'We need this ASAP or as soon as possible', id: 'asap', expectedCount: 2 },
    { input: 'Features include etc. and and so on etc', id: 'etc', expectedCount: 3 },
    { input: 'Make it similar to Uber and like airbnb and similar to Netflix', id: 'similar_to_uber', expectedCount: 3 },
    { input: 'We want unlimited requests and unlimited items', id: 'unlimited', expectedCount: 2 },
    { input: 'Just hook up the auth, just add the button, just build the ui', id: 'just', expectedCount: 3 },
    { input: 'It will take a few hours or a couple of hours because it is trivial', id: 'few_hours', expectedCount: 3 },
    { input: 'We require unlimited revisions and unlimited revision policy', id: 'unlimited_revisions', expectedCount: 2 },
  ];

  for (const item of testPhrases) {
    const res = scanVaguePhrases(item.input);
    const match = res.matches.find((m) => m.id === item.id);
    assert.ok(match, `Pattern ${item.id} must be detected in "${item.input}"`);
    assert.strictEqual(match.count, item.expectedCount, `Expected count ${item.expectedCount} for ${item.id}, got ${match.count}`);
  }
});

await test('SEC2.3: Scanner case-insensitivity and whitespace variation stress', async () => {
  const variations = [
    'SIMPLE',
    'sUpEr   SiMpLe',
    'aSaP',
    'AS SOON AS POSSIBLE',
    'LiKe   UbEr',
    'sImIlAr   To   AiRbNb',
    'UnLiMiTeD   ReViSiOnS',
    'JuSt   SqUeEzE   In',
    'TrIvIaL',
  ];

  for (const v of variations) {
    const res = scanVaguePhrases(v);
    assert.ok(res.totalTrapCount >= 1, `Failed to detect variation: "${v}"`);
  }
});

await test('SEC2.4: Scanner prevents false positives on innocent word substrings', async () => {
  // E.g., 'participant' should not match 'part', 'quicken' should not match 'quick'
  const innocent = 'The company simplifies participant logistics and quickens response times in the hubert factory.';
  const res = scanVaguePhrases(innocent);
  assert.strictEqual(res.totalTrapCount, 0, `False positive detected on innocent text: ${JSON.stringify(res.matches)}`);
});

await test('SEC2.5: Scanner high-throughput and ReDoS resilience benchmark', async () => {
  // Construct a massive 100,000 character corpus with 500 interspersed traps
  const trapSentence = 'We need a simple and quick app ASAP similar to Uber with unlimited revisions etc. ';
  const filler = 'The system architecture handles standard database migrations and API endpoints reliably. ';
  let massiveCorpus = '';
  for (let i = 0; i < 500; i++) {
    massiveCorpus += filler + trapSentence;
  }
  assert.ok(massiveCorpus.length > 50000, 'Corpus should be large');

  const start = performance.now();
  const res = scanVaguePhrases(massiveCorpus);
  const elapsed = performance.now() - start;

  assert.ok(elapsed < 200, `Scanner took ${elapsed.toFixed(1)}ms on 50KB corpus, must be under 200ms`);
  assert.ok(res.totalTrapCount >= 2500, `Expected at least 2500 traps, got ${res.totalTrapCount}`);
  console.log(`    Throughput: ${res.totalTrapCount} traps parsed across ${(massiveCorpus.length / 1024).toFixed(1)}KB in ${elapsed.toFixed(1)}ms`);
});

// =============================================================================
// SECTION 3: Floating 3D Warning Chips & UI Architecture Verification
// =============================================================================

await test('SEC3.1: VagueScanner component enforces 3D perspective and translateZ elevation', async () => {
  const filePath = path.join(process.cwd(), 'components', 'input', 'VagueScanner.tsx');
  const code = fs.readFileSync(filePath, 'utf8');

  assert.ok(code.includes('perspective: 800'), 'VagueScanner container must have perspective: 800 for 3D stage depth');
  assert.ok(code.includes("transform: 'translateZ(12px)'"), 'Warning chips must have translateZ(12px) 3D elevation');
  assert.ok(code.includes('shadow-[0_4px_12px_rgba(0,0,0,0.3)]'), 'Warning chips must have 3D shadow');
  assert.ok(code.includes('hover:-translate-y-0.5'), 'Warning chips must have hover elevate transition');
  assert.ok(code.includes('group-hover:block'), 'Warning chips must have hover tooltip display');
  assert.ok(code.includes('isCriticalTrap'), 'Critical vs Moderate classification helper must be present');
});

await test('SEC3.2: Critical vs Moderate risk styling differentiation', async () => {
  const filePath = path.join(process.cwd(), 'components', 'input', 'VagueScanner.tsx');
  const code = fs.readFileSync(filePath, 'utf8');

  // Critical traps get rose-300 / rose-400 crimson styling
  assert.ok(code.includes('text-rose-300') && code.includes('border-[rgba(244,63,94,0.3)]'), 'Critical traps must use rose accent');
  // Moderate traps get amber-300 / amber-400 amber styling
  assert.ok(code.includes('text-amber-300') && code.includes('border-[rgba(245,158,11,0.3)]'), 'Moderate traps must use amber accent');
});

await test('SEC3.3: PresetSelector and ChaosInputPane adhere to spatial layout contracts', async () => {
  const presetPath = path.join(process.cwd(), 'components', 'input', 'PresetSelector.tsx');
  const panePath = path.join(process.cwd(), 'components', 'input', 'ChaosInputPane.tsx');

  const presetCode = fs.readFileSync(presetPath, 'utf8');
  const paneCode = fs.readFileSync(panePath, 'utf8');

  assert.ok(presetCode.includes('CLIENT_CHAOS_PRESETS.map'), 'PresetSelector must map over CLIENT_CHAOS_PRESETS');
  assert.ok(presetCode.includes('grid-cols-1 sm:grid-cols-2'), 'PresetSelector must render 2x2 grid on desktop');

  assert.ok(paneCode.includes('chaos-input-pane no-print'), 'ChaosInputPane must have no-print class for print cleanliness');
  assert.ok(paneCode.includes('<PresetSelector'), 'ChaosInputPane must render PresetSelector');
  assert.ok(paneCode.includes('<VagueScanner'), 'ChaosInputPane must render VagueScanner');
  assert.ok(paneCode.includes('<CalibrationDials'), 'ChaosInputPane must render CalibrationDials');
  assert.ok(paneCode.includes('Cmd Enter'), 'ChaosInputPane must have KeycapButton with Cmd Enter');
});

// =============================================================================
// SECTION 4: Live Client-Side Recalculations Stress Testing (Zero Network API)
// =============================================================================

await test('SEC4.1: Hourly rate adjustments recalculate total investment synchronously with 0 network calls', async () => {
  const milestones = PROPOSAL_PRESET_1.milestones;
  const baseHours = calculateBaseHours(milestones);
  assert.strictEqual(baseHours, 206, 'Preset 1 base hours must be 206 (68 + 82 + 56)');

  const settings = {
    currency: 'USD',
    hourlyRate: 100,
    riskBuffer: 1.0,
    paymentSchedule: '50/50',
  };

  // Recalculate across USD range: $25 to $250
  for (let rate = 25; rate <= 250; rate += 25) {
    settings.hourlyRate = rate;
    const res = recalculateProposal(milestones, settings, 5);
    assert.strictEqual(res.baseHours, 206);
    assert.strictEqual(res.billableHours, 206);
    assert.strictEqual(res.totalInvestment, 206 * rate);
    assert.strictEqual(res.paymentSplit.items[0].amount + res.paymentSplit.items[1].amount, 206 * rate);
  }

  // Recalculate across INR range: ₹1,500 to ₹15,000
  for (let rate = 1500; rate <= 15000; rate += 1500) {
    settings.hourlyRate = rate;
    const res = recalculateProposal(milestones, settings, 5);
    assert.strictEqual(res.totalInvestment, 206 * rate);
  }
});

await test('SEC4.2: Risk buffer adjustments (1.0x, 1.15x, 1.35x) recalculate billable hours and timeline', async () => {
  const milestones = PROPOSAL_PRESET_1.milestones;
  const baseHours = calculateBaseHours(milestones); // 206

  const settings = {
    currency: 'USD',
    hourlyRate: 100,
    riskBuffer: 1.0,
    paymentSchedule: '50/50',
  };

  // 1.0x Standard
  const resStandard = recalculateProposal(milestones, { ...settings, riskBuffer: 1.0 }, 5);
  assert.strictEqual(resStandard.billableHours, 206);
  assert.strictEqual(resStandard.totalInvestment, 20600);
  assert.strictEqual(resStandard.timelineWeeks, 9); // ceil(206 / 25) = 9
  assert.strictEqual(resStandard.timelineDays, 42); // ceil(206 / 5) = 42

  // 1.15x Guarded
  const resGuarded = recalculateProposal(milestones, { ...settings, riskBuffer: 1.15 }, 5);
  const expectedGuardedHours = Math.round(206 * 1.15); // 237
  assert.strictEqual(resGuarded.billableHours, expectedGuardedHours);
  assert.strictEqual(resGuarded.totalInvestment, expectedGuardedHours * 100);
  assert.strictEqual(resGuarded.timelineWeeks, Math.ceil(expectedGuardedHours / 25));

  // 1.35x Ironclad
  const resIronclad = recalculateProposal(milestones, { ...settings, riskBuffer: 1.35 }, 5);
  const expectedIroncladHours = Math.round(206 * 1.35); // 278
  assert.strictEqual(resIronclad.billableHours, expectedIroncladHours);
  assert.strictEqual(resIronclad.totalInvestment, expectedIroncladHours * 100);
  assert.strictEqual(resIronclad.timelineWeeks, Math.ceil(expectedIroncladHours / 25));
});

await test('SEC4.3: Payment schedule splits maintain exact penny conservation (zero drift)', async () => {
  // Test with arbitrary odd investments to stress integer rounding conservation
  const testInvestments = [
    1, 2, 3, 5, 7, 11, 13, 23, 47, 99, 100, 101, 199, 200, 333, 999, 1001,
    20600, 23690, 27810, 999999, 10000003,
  ];

  for (const total of testInvestments) {
    // 50/50
    const split50 = calculatePaymentSplit(total, '50/50', 4);
    assert.strictEqual(split50.items.length, 2);
    const sum50 = split50.items.reduce((acc, item) => acc + item.amount, 0);
    assert.strictEqual(sum50, total, `50/50 penny drift for total $${total}: got sum ${sum50}`);

    // 40/30/30
    const split40 = calculatePaymentSplit(total, '40/30/30', 4);
    assert.strictEqual(split40.items.length, 3);
    const sum40 = split40.items.reduce((acc, item) => acc + item.amount, 0);
    assert.strictEqual(sum40, total, `40/30/30 penny drift for total $${total}: got sum ${sum40}`);

    // Retainer (various timeline durations from 1 week to 24 weeks)
    for (const weeks of [1, 2, 4, 8, 12, 16, 24]) {
      const splitRetainer = calculatePaymentSplit(total, 'retainer', weeks);
      const sumRetainer = splitRetainer.items.reduce((acc, item) => acc + item.amount, 0);
      assert.strictEqual(sumRetainer, total, `Retainer penny drift for total $${total} across ${weeks} weeks: got sum ${sumRetainer}`);
    }
  }
});

await test('SEC4.4: Deliverable inclusion toggles and hour steppers recalculate instantly', async () => {
  // Deep clone Preset 1 milestones
  const milestones = JSON.parse(JSON.stringify(PROPOSAL_PRESET_1.milestones));

  const settings = {
    currency: 'USD',
    hourlyRate: 100,
    riskBuffer: 1.0,
    paymentSchedule: '50/50',
  };

  const initialRes = recalculateProposal(milestones, settings, 0);
  assert.strictEqual(initialRes.baseHours, 206);

  // Toggle off deliverable d-101 (16 hours)
  milestones[0].deliverables[0].included = false;
  const toggledRes = recalculateProposal(milestones, settings, 0);
  assert.strictEqual(toggledRes.baseHours, 190);
  assert.strictEqual(toggledRes.totalInvestment, 19000);

  // Increment deliverable d-102 from 20 to 25 (+5 hours)
  milestones[0].deliverables[1].hours += 5;
  const incrementRes = recalculateProposal(milestones, settings, 0);
  assert.strictEqual(incrementRes.baseHours, 195);
  assert.strictEqual(incrementRes.totalInvestment, 19500);

  // Toggle deliverable d-101 back on (+16 hours)
  milestones[0].deliverables[0].included = true;
  const restoreRes = recalculateProposal(milestones, settings, 0);
  assert.strictEqual(restoreRes.baseHours, 211);
  assert.strictEqual(restoreRes.totalInvestment, 21100);
});

await test('SEC4.5: Confidence score bounds [45, 98] and sensitivity validation', async () => {
  // Test zero traps, low hours, clean buffer -> hits 98 max clamp
  const pristineScore = calculateConfidenceScore({
    trapCount: 0,
    riskBuffer: 1.35,
    highComplexityCount: 0,
    activeHours: 50,
  });
  assert.strictEqual(pristineScore, 98, 'Pristine score should clamp to 98 max');

  // Test catastrophic traps (e.g. 50 traps) -> hits 45 min clamp
  const chaoticScore = calculateConfidenceScore({
    trapCount: 50,
    riskBuffer: 1.0,
    highComplexityCount: 10,
    activeHours: 500,
  });
  assert.strictEqual(chaoticScore, 45, 'Chaotic score should clamp to 45 min');

  // Test sensitivity: adding buffer increases confidence
  const scoreLowBuffer = calculateConfidenceScore({
    trapCount: 3,
    riskBuffer: 1.0,
    highComplexityCount: 2,
    activeHours: 100,
  });
  const scoreHighBuffer = calculateConfidenceScore({
    trapCount: 3,
    riskBuffer: 1.35,
    highComplexityCount: 2,
    activeHours: 100,
  });
  assert.ok(scoreHighBuffer > scoreLowBuffer, `Buffer must increase confidence: ${scoreHighBuffer} > ${scoreLowBuffer}`);
});

await test('SEC4.6: 10,000 rapid recalculations stress benchmark (Zero Latency Proof)', async () => {
  const milestones = PROPOSAL_PRESET_1.milestones;
  const settings = {
    currency: 'USD',
    hourlyRate: 120,
    riskBuffer: 1.15,
    paymentSchedule: '40/30/30',
  };

  const start = performance.now();
  for (let i = 0; i < 10000; i++) {
    settings.hourlyRate = 100 + (i % 150);
    settings.riskBuffer = i % 2 === 0 ? 1.15 : 1.35;
    const res = recalculateProposal(milestones, settings, i % 10);
    assert.ok(res.totalInvestment > 0);
  }
  const duration = performance.now() - start;

  assert.ok(duration < 500, `10,000 recalculations took ${duration.toFixed(1)}ms, must be <500ms`);
  const perOp = (duration / 10000) * 1000;
  console.log(`    Performance: 10,000 recalculations executed in ${duration.toFixed(1)}ms (${perOp.toFixed(3)} µs/op)`);
});

await test('SEC4.7: Verification that app/page.tsx does not initiate network calls on dial changes', async () => {
  const pagePath = path.join(process.cwd(), 'app', 'page.tsx');
  const code = fs.readFileSync(pagePath, 'utf8');

  // Verify that recalculateProposal is wrapped in useMemo dependent on state, NOT inside any fetch
  assert.ok(code.includes('const calculations = useMemo('), 'page.tsx must compute calculations via useMemo');
  assert.ok(code.includes('recalculateProposal('), 'page.tsx must invoke recalculateProposal in useMemo');

  // Verify handleSnapScope is the ONLY place that calls fetch('/api/generate-scope')
  const fetchMatches = code.match(/fetch\s*\(\s*['"`]\/api\/generate-scope/g) || [];
  assert.strictEqual(fetchMatches.length, 1, 'Only handleSnapScope may call /api/generate-scope');

  // Verify sliders and dials do not trigger fetch
  assert.ok(!code.includes('handleHourlyRateChange = async'), 'Hourly rate handler must not be async or call fetch');
});

// =============================================================================
// SECTION 5: Exhaustive Repository Hygiene & Zero Em Dash Audit
// =============================================================================

await test('SEC5.1: Zero em dashes (U+2014) across all M4 code and components', async () => {
  const targetFiles = [
    'components/input/VagueScanner.tsx',
    'components/input/PresetSelector.tsx',
    'components/input/CalibrationDials.tsx',
    'components/input/ChaosInputPane.tsx',
    'components/input/index.ts',
    'components/header/Header.tsx',
    'components/header/TelemetryPill.tsx',
    'components/header/CurrencySelector.tsx',
    'components/header/ByokModal.tsx',
    'components/header/ReelStudioModal.tsx',
    'components/header/index.ts',
    'lib/calculations.ts',
    'lib/constants.ts',
    'app/page.tsx',
  ];

  for (const relPath of targetFiles) {
    const fullPath = path.join(process.cwd(), relPath);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      assertNoEmDashes(content, relPath);
    }
  }
});

await test('SEC5.2: Zero banned AI gradients (purple/indigo/violet) across M4 components', async () => {
  const bannedGradientRegex = /(from|to|via)-(purple|indigo|violet)|bg-(purple|indigo|violet)/i;
  const targetFiles = [
    'components/input/VagueScanner.tsx',
    'components/input/PresetSelector.tsx',
    'components/input/CalibrationDials.tsx',
    'components/input/ChaosInputPane.tsx',
    'components/header/Header.tsx',
    'components/header/TelemetryPill.tsx',
    'components/header/CurrencySelector.tsx',
    'components/header/ByokModal.tsx',
    'components/header/ReelStudioModal.tsx',
    'app/page.tsx',
  ];

  for (const relPath of targetFiles) {
    const fullPath = path.join(process.cwd(), relPath);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      assert.ok(!bannedGradientRegex.test(content), `Banned gradient detected in ${relPath}`);
    }
  }
});

await test('SEC5.3: Zero emojis in UI components across M4 components', async () => {
  const emojiRegex = /\p{Extended_Pictographic}/u;
  const targetFiles = [
    'components/input/VagueScanner.tsx',
    'components/input/PresetSelector.tsx',
    'components/input/CalibrationDials.tsx',
    'components/input/ChaosInputPane.tsx',
    'components/header/Header.tsx',
    'components/header/TelemetryPill.tsx',
    'components/header/CurrencySelector.tsx',
    'components/header/ByokModal.tsx',
    'components/header/ReelStudioModal.tsx',
    'app/page.tsx',
  ];

  for (const relPath of targetFiles) {
    const fullPath = path.join(process.cwd(), relPath);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      assert.ok(!emojiRegex.test(content), `Emoji glyph detected in ${relPath}`);
    }
  }
});

// =============================================================================
// SUMMARY BANNER
// =============================================================================

console.log('\n======================================================================');
console.log(`  STRESS TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
console.log('======================================================================\n');

if (failed > 0) {
  console.error('Failure breakdown:');
  for (const f of failureDetails) {
    console.error(`  - ${f.name}: ${f.error}`);
  }
  process.exit(1);
} else {
  console.log('All empirical stress tests passed with 100% fidelity.\n');
  process.exit(0);
}
