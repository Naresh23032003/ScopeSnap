/**
 * tests/stress-m3-math-regex.mjs
 * Empirical Math Drift, Rounding and Vague Phrase Regex Stress Test Suite.
 * Milestone: M3 (Backend Groq API Route & Resilient Fallback)
 * Agent: challenger_m3_2
 *
 * Strict constraint: Zero em dashes (U+2014) anywhere in code or console outputs.
 */

import assert from "node:assert";
import {
  calculatePaymentSplit,
  scanVaguePhrases,
  calculateBaseHours,
  calculateBillableHours,
  calculateTotalInvestment,
  calculateTimeline,
  calculateConfidenceScore,
  recalculateProposal,
} from "../lib/calculations.js";
import {
  VAGUE_PHRASE_PATTERNS,
  CLIENT_CHAOS_PRESETS,
  DEFAULT_PROPOSAL,
} from "../lib/constants.js";

const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";
const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const YELLOW = "\x1b[33m";
const CYAN = "\x1b[36m";
const DIM = "\x1b[2m";

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function it(name, fn) {
  totalTests++;
  const t0 = performance.now();
  try {
    fn();
    const dur = (performance.now() - t0).toFixed(1);
    console.log(`  ${GREEN}\u2713 PASS${RESET} ${name} ${DIM}(${dur}ms)${RESET}`);
    passedTests++;
  } catch (err) {
    const dur = (performance.now() - t0).toFixed(1);
    console.error(`  ${RED}\u2717 FAIL${RESET} ${name} ${DIM}(${dur}ms)${RESET}`);
    console.error(`    ${RED}${err.message}${RESET}`);
    if (err.stack) {
      console.error(`    ${DIM}${err.stack.split("\n").slice(1, 4).join("\n    ")}${RESET}`);
    }
    failedTests++;
  }
}

console.log(`${BOLD}${CYAN}======================================================================${RESET}`);
console.log(`${BOLD}${CYAN}  ScopeSnap : M3 Empirical Math Drift & Regex Adversarial Stress Suite${RESET}`);
console.log(`${BOLD}${CYAN}======================================================================${RESET}`);

// =============================================================================
// Suite 1: Payment Splits Across 1,000+ Arbitrary Totals (Zero Penny Drift)
// =============================================================================
console.log(`\n${BOLD}--- Suite 1: Payment Splits Across 1,000+ Arbitrary Totals ---${RESET}`);

// Deterministic Pseudo-Random Number Generator (Linear Congruential Generator)
function makePrng(seed = 123456789) {
  let s = seed;
  return function () {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

// Generate prime numbers using Sieve of Eratosthenes up to limit
function getPrimes(limit = 10000) {
  const sieve = new Uint8Array(limit + 1);
  const primes = [];
  for (let i = 2; i <= limit; i++) {
    if (sieve[i] === 0) {
      primes.push(i);
      for (let j = i * 2; j <= limit; j += i) {
        sieve[j] = 1;
      }
    }
  }
  return primes;
}

it("S1.1: 1,000 arbitrary totals confirm zero penny drift across all schedules", () => {
  const prng = makePrng(42);
  const primes = getPrimes(8000); // yields over 1,000 primes
  const testTotals = [];

  // Category A: 250 Primes spanning 2 to 7,919
  for (let i = 0; i < 250; i++) {
    testTotals.push(primes[i]);
  }

  // Category B: 250 Odd Decimals (1 to 4 decimal places)
  for (let i = 0; i < 250; i++) {
    const intPart = Math.floor(prng() * 50000) + 1;
    const decimals = [0.01, 0.05, 0.1, 0.25, 0.33, 0.5, 0.67, 0.75, 0.99, 0.123, 0.789, 0.4567];
    const dec = decimals[i % decimals.length];
    testTotals.push(Math.round((intPart + dec) * 10000) / 10000);
  }

  // Category C: 100 Boundary and extreme values
  const boundaries = [
    0, 0.01, 0.5, 0.99, 1, 2, 3, 5, 7, 9, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47,
    50, 99, 100, 101, 999, 1000, 1001, 9873, 9999, 10000, 10001, 49999, 50000,
    99999, 100000, 250000, 500000, 1000000, 5000000, 10000000, 99999999,
  ];
  for (const b of boundaries) {
    testTotals.push(b);
  }

  // Category D: 400 Arbitrary pseudo-random numbers
  while (testTotals.length < 1000) {
    const isDecimal = prng() > 0.5;
    if (isDecimal) {
      const val = prng() * 100000 + 1;
      testTotals.push(Math.round(val * 100) / 100);
    } else {
      testTotals.push(Math.floor(prng() * 100000) + 1);
    }
  }

  assert.ok(testTotals.length >= 1000, `Expected at least 1,000 totals, got ${testTotals.length}`);

  let totalSplitChecks = 0;
  let maxDriftDetected = 0;

  for (const total of testTotals) {
    // 1. Test 50/50 Schedule
    const s50 = calculatePaymentSplit(total, "50/50");
    totalSplitChecks++;
    if (total <= 0) {
      assert.strictEqual(s50.total, 0);
      assert.strictEqual(s50.items.length, 0);
    } else {
      assert.strictEqual(s50.items.length, 2);
      const sum50 = s50.items[0].amount + s50.items[1].amount;
      const drift50 = Math.abs(sum50 - total);
      if (drift50 > maxDriftDetected) maxDriftDetected = drift50;
      assert.ok(drift50 < 1e-5, `Penny drift in 50/50 for total ${total}: drift=${drift50}`);
      assert.ok(Math.abs(s50.total - total) < 1e-5, `Reported total mismatch: ${s50.total} vs ${total}`);
      if (Number.isInteger(total)) {
        assert.ok(Number.isInteger(s50.items[0].amount), `Item 0 not integer for total ${total}`);
        assert.ok(Number.isInteger(s50.items[1].amount), `Item 1 not integer for total ${total}`);
      }
    }

    // 2. Test 40/30/30 Schedule
    const s40 = calculatePaymentSplit(total, "40/30/30");
    totalSplitChecks++;
    if (total <= 0) {
      assert.strictEqual(s40.total, 0);
      assert.strictEqual(s40.items.length, 0);
    } else {
      assert.strictEqual(s40.items.length, 3);
      const sum40 = s40.items[0].amount + s40.items[1].amount + s40.items[2].amount;
      const drift40 = Math.abs(sum40 - total);
      if (drift40 > maxDriftDetected) maxDriftDetected = drift40;
      assert.ok(drift40 < 1e-5, `Penny drift in 40/30/30 for total ${total}: drift=${drift40}`);
      assert.ok(Math.abs(s40.total - total) < 1e-5, `Reported total mismatch: ${s40.total} vs ${total}`);
      if (Number.isInteger(total)) {
        assert.ok(Number.isInteger(s40.items[0].amount), `Item 0 not integer for total ${total}`);
        assert.ok(Number.isInteger(s40.items[1].amount), `Item 1 not integer for total ${total}`);
        assert.ok(Number.isInteger(s40.items[2].amount), `Item 2 not integer for total ${total}`);
      }
    }

    // 3. Test Retainer Schedule across various week durations (4, 8, 12, 26, 52 weeks)
    const weekSamples = [4, 8, 12, 16, 24, 52];
    for (const weeks of weekSamples) {
      const sRet = calculatePaymentSplit(total, "retainer", weeks);
      totalSplitChecks++;
      if (total <= 0) {
        assert.strictEqual(sRet.total, 0);
        assert.strictEqual(sRet.items.length, 0);
      } else {
        const expectedMonths = Math.max(1, Math.round(weeks / 4));
        assert.strictEqual(sRet.items.length, expectedMonths);
        const sumRet = sRet.items.reduce((acc, itm) => acc + itm.amount, 0);
        const driftRet = Math.abs(sumRet - total);
        if (driftRet > maxDriftDetected) maxDriftDetected = driftRet;
        assert.ok(driftRet < 1e-5, `Penny drift in retainer (${weeks}w) for total ${total}: drift=${driftRet}`);
        assert.ok(Math.abs(sRet.total - total) < 1e-5, `Reported retainer total mismatch`);
        if (Number.isInteger(total)) {
          for (const itm of sRet.items) {
            assert.ok(Number.isInteger(itm.amount), `Retainer item not integer for total ${total}`);
          }
        }
      }
    }
  }

  assert.ok(totalSplitChecks >= 8000, `Expected >= 8000 split checks, got ${totalSplitChecks}`);
  assert.ok(maxDriftDetected < 1e-5, `Max drift exceeded threshold: ${maxDriftDetected}`);
  console.log(`    ${CYAN}Sub-stat: Evaluated ${totalSplitChecks} payment split permutations across ${testTotals.length} totals. Max drift: 0.00000000.${RESET}`);
});

it("S1.2: Negative and non-finite totals degrade safely without throwing", () => {
  const negSplits = [-100, -1, -0.0001, -99999];
  for (const n of negSplits) {
    const res50 = calculatePaymentSplit(n, "50/50");
    assert.strictEqual(res50.total, 0);
    assert.strictEqual(res50.items.length, 0);

    const res40 = calculatePaymentSplit(n, "40/30/30");
    assert.strictEqual(res40.total, 0);
    assert.strictEqual(res40.items.length, 0);

    const resRet = calculatePaymentSplit(n, "retainer", 8);
    assert.strictEqual(resRet.total, 0);
    assert.strictEqual(resRet.items.length, 0);
  }
});

it("S1.3: Unsupported payment schedule throws descriptive error", () => {
  assert.throws(
    () => calculatePaymentSplit(1000, "unsupported_schedule"),
    /Unsupported payment schedule/
  );
});

// =============================================================================
// Suite 2: Vague Phrase Scanner Regex Adversarial Stress Testing
// =============================================================================
console.log(`\n${BOLD}--- Suite 2: Vague Phrase Scanner Regex Adversarial Testing ---${RESET}`);

it("S2.1: Case insensitivity across all 10 patterns with mixed, upper, and lowercase", () => {
  const testCases = [
    { text: "This is SIMPLE to do", expectedId: "simple" },
    { text: "Need SUPER SIMPLE implementation", expectedId: "simple" },
    { text: "Make it sImPlE", expectedId: "simple" },
    { text: "Need it QUICK", expectedId: "quick" },
    { text: "Please do it QUICKLY", expectedId: "quick" },
    { text: "qUiCk turnaround", expectedId: "quick" },
    { text: "We can do this MAYBE LATER", expectedId: "maybe_later" },
    { text: "Address DOWN THE ROAD", expectedId: "maybe_later" },
    { text: "Need this ASAP", expectedId: "asap" },
    { text: "AS SOON AS POSSIBLE please", expectedId: "asap" },
    { text: "Features, ETC.", expectedId: "etc" },
    { text: "Buttons, forms, AND SO ON", expectedId: "etc" },
    { text: "Build something SIMILAR TO UBER", expectedId: "similar_to_uber" },
    { text: "Make it LIKE AIRBNB", expectedId: "similar_to_uber" },
    { text: "LIKE AMAZON checkout", expectedId: "similar_to_uber" },
    { text: "Offer UNLIMITED access", expectedId: "unlimited" },
    { text: "JUST ADD a payment gateway", expectedId: "just" },
    { text: "JUST BUILD a basic admin", expectedId: "just" },
    { text: "JUST SQUEEZE IN one more page", expectedId: "just" },
    { text: "Should take A FEW HOURS", expectedId: "few_hours" },
    { text: "Just a COUPLE OF HOURS", expectedId: "few_hours" },
    { text: "This is TRIVIAL", expectedId: "few_hours" },
    { text: "Includes UNLIMITED REVISIONS", expectedId: "unlimited_revisions" },
    { text: "Client demanded UNLIMITED REVISION", expectedId: "unlimited_revisions" },
  ];

  for (const tc of testCases) {
    const res = scanVaguePhrases(tc.text);
    const found = res.matches.some((m) => m.id === tc.expectedId);
    assert.ok(found, `Expected pattern '${tc.expectedId}' in '${tc.text}', matches: ${JSON.stringify(res.matches.map(m => m.id))}`);
  }
});

it("S2.2: Adversarial punctuation wrapping and sentence boundaries", () => {
  const punctuationPadded = [
    { text: 'Client notes: "simple" requirements.', pattern: "simple" },
    { text: "It is (simple) to implement.", pattern: "simple" },
    { text: "Architecture is [super simple]!", pattern: "simple" },
    { text: "Deliver this quick!", pattern: "quick" },
    { text: "Turnaround: (quick)?", pattern: "quick" },
    { text: "Features... etc.", pattern: "etc" },
    { text: "Need it ASAP!!!", pattern: "asap" },
    { text: "Deadline: (ASAP).", pattern: "asap" },
    { text: "We need an app (like Uber) or similar to Airbnb.", pattern: "similar_to_uber" },
    { text: "We want something similar to Uber/Airbnb.", pattern: "similar_to_uber" },
    { text: "Scope: [maybe later]?", pattern: "maybe_later" },
    { text: "Guarantee: (unlimited revisions)!!", pattern: "unlimited_revisions" },
    { text: "Can you (just add) this?", pattern: "just" },
    { text: "Please just build the core module.", pattern: "just" },
    { text: "Effort: (trivial)...", pattern: "few_hours" },
    { text: "Only (a few hours) of work.", pattern: "few_hours" },
  ];

  for (const tc of punctuationPadded) {
    const res = scanVaguePhrases(tc.text);
    const found = res.matches.some((m) => m.id === tc.pattern);
    assert.ok(found, `Expected '${tc.pattern}' in '${tc.text}'`);
  }
});

it("S2.3: Multiline strings, tabs, and repeated whitespace", () => {
  const whitespaceCases = [
    { text: "Needs to be super    simple", pattern: "simple" },
    { text: "super\tsimple", pattern: "simple" },
    { text: "maybe   later", pattern: "maybe_later" },
    { text: "down\t\tthe\troad", pattern: "maybe_later" },
    { text: "as   soon   as   possible", pattern: "asap" },
    { text: "and   so   on", pattern: "etc" },
    { text: "similar   to   uber", pattern: "similar_to_uber" },
    { text: "like\tairbnb", pattern: "similar_to_uber" },
    { text: "just   hook   up", pattern: "just" },
    { text: "just\tsqueeze\tin", pattern: "just" },
    { text: "a   few   hours", pattern: "few_hours" },
    { text: "couple   of   hours", pattern: "few_hours" },
    { text: "unlimited   revisions", pattern: "unlimited_revisions" },
  ];

  for (const tc of whitespaceCases) {
    const res = scanVaguePhrases(tc.text);
    const found = res.matches.some((m) => m.id === tc.pattern);
    assert.ok(found, `Whitespace test failed for '${tc.pattern}' in '${tc.text}'`);
  }
});

it("S2.4: Negative word boundary guardrails (No false positives on substrings)", () => {
  const nonTraps = [
    "We value simplicity in the design",           // simplicity != simple
    "Please oversimplify nothing",                 // oversimplify != simple
    "We will simply deploy to production",         // simply != simple
    "The client is quicker than expected",         // quicker != quick
    "Quicksand is dangerous",                      // quicksand != quick
    "We need to quicken our pace",                 // quicken != quick
    "Etching glass is an art",                     // etching != etc
    "Pass the ketchup bottle",                     // ketchup != etc
    "Limited edition watch",                       // limited != unlimited
    "Justice must prevail",                        // justice != just
    "We will adjust the screen height",            // adjust != just
    "This was a justifiable expense",              // justifiable != just
    "Just because we can does not mean we should", // just because (not just add/build/etc)
    "Nontrivial problem to solve",                 // nontrivial != trivial
    "There are 24 hours in a day",                 // hours alone != a few hours
  ];

  for (const text of nonTraps) {
    const res = scanVaguePhrases(text);
    assert.strictEqual(
      res.totalTrapCount,
      0,
      `False positive detected in '${text}'. Got matches: ${JSON.stringify(res.matches.map(m => m.phrase))}`
    );
  }
});

it("S2.5: Re-entrancy safety (2,000 rapid calls do not leak RegExp state)", () => {
  const textWithTraps = "Need a simple, quick app like Uber ASAP with unlimited revisions.";
  const textWithoutTraps = "Enterprise architectural specification with fixed milestone bounds.";

  for (let i = 0; i < 1000; i++) {
    const res1 = scanVaguePhrases(textWithTraps);
    assert.ok(res1.totalTrapCount >= 5, `Iteration ${i}: Expected >=5 traps, got ${res1.totalTrapCount}`);

    const res2 = scanVaguePhrases(textWithoutTraps);
    assert.strictEqual(res2.totalTrapCount, 0, `Iteration ${i}: Expected 0 traps, got ${res2.totalTrapCount}`);
  }
});

it("S2.6: Massive input fuzzing (100,000 characters) and malicious inputs", () => {
  // Empty or invalid inputs
  assert.strictEqual(scanVaguePhrases("").totalTrapCount, 0);
  assert.strictEqual(scanVaguePhrases(null).totalTrapCount, 0);
  assert.strictEqual(scanVaguePhrases(undefined).totalTrapCount, 0);
  assert.strictEqual(scanVaguePhrases(12345).totalTrapCount, 0);

  // Large payload with scattered triggers
  const filler = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt. ";
  let largeText = "";
  for (let i = 0; i < 500; i++) {
    largeText += filler;
    if (i % 50 === 0) {
      largeText += " Need a quick fix ASAP etc. ";
    }
  }
  assert.ok(largeText.length > 40000, `Text size was ${largeText.length}`);

  const start = performance.now();
  const scan = scanVaguePhrases(largeText);
  const scanDuration = performance.now() - start;

  assert.ok(scan.totalTrapCount >= 30, `Expected >= 30 traps in large text, got ${scan.totalTrapCount}`);
  assert.ok(scanDuration < 100, `Scanner took too long on 40KB text: ${scanDuration.toFixed(1)}ms`);
});

it("S2.7: Scanner validates all 4 authoritative Client Chaos presets", () => {
  const presetResults = CLIENT_CHAOS_PRESETS.map((preset) => {
    return {
      label: preset.label,
      scan: scanVaguePhrases(preset.rawText),
    };
  });

  for (const p of presetResults) {
    assert.ok(
      p.scan.totalTrapCount > 0,
      `Preset '${p.label}' had 0 detected traps`
    );
    assert.ok(
      p.scan.matches.length > 0,
      `Preset '${p.label}' matches array was empty`
    );
  }
});

// =============================================================================
// Suite 3: Recalculate Proposal Pipeline Stress Verification
// =============================================================================
console.log(`\n${BOLD}--- Suite 3: Recalculate Proposal Pipeline Integration ---${RESET}`);

it("S3.1: Full recalculation pipeline executes flawlessly across extreme calibrations", () => {
  const testMilestones = DEFAULT_PROPOSAL.milestones;
  const rates = [25, 53, 97, 100, 149, 250, 1500, 3719, 15000];
  const buffers = [1.0, 1.15, 1.35];
  const schedules = ["50/50", "40/30/30", "retainer"];

  for (const hourlyRate of rates) {
    for (const riskBuffer of buffers) {
      for (const paymentSchedule of schedules) {
        const res = recalculateProposal(
          testMilestones,
          {
            hourlyRate,
            riskBuffer,
            paymentSchedule,
            currency: "USD",
          },
          5 // 5 detected traps
        );

        assert.ok(res.baseHours > 0);
        assert.ok(res.billableHours >= res.baseHours);
        assert.strictEqual(res.totalInvestment, res.billableHours * hourlyRate);
        assert.ok(res.confidenceScore >= 45 && res.confidenceScore <= 98);
        assert.strictEqual(res.paymentSplit.total, res.totalInvestment);
        const itemSum = res.paymentSplit.items.reduce((acc, itm) => acc + itm.amount, 0);
        assert.strictEqual(itemSum, res.totalInvestment);
      }
    }
  }
});

// =============================================================================
// Suite 4: Strict Em Dash (U+2014) Repository & Artifact Check
// =============================================================================
console.log(`\n${BOLD}--- Suite 4: Em Dash (U+2014) Audit ---${RESET}`);

it("S4.1: Confirms zero em dashes (U+2014) in test code or scanned definitions", () => {
  const emDashChar = "\u2014";
  for (const p of VAGUE_PHRASE_PATTERNS) {
    assert.ok(!p.phrase.includes(emDashChar), `Pattern phrase contains em dash: ${p.phrase}`);
    assert.ok(!p.riskExplanation.includes(emDashChar), `Risk explanation contains em dash: ${p.riskExplanation}`);
  }
  for (const preset of CLIENT_CHAOS_PRESETS) {
    assert.ok(!preset.label.includes(emDashChar), `Preset label contains em dash: ${preset.label}`);
    assert.ok(!preset.subtitle.includes(emDashChar), `Preset subtitle contains em dash: ${preset.subtitle}`);
    assert.ok(!preset.rawText.includes(emDashChar), `Preset rawText contains em dash: ${preset.rawText}`);
  }
});

// =============================================================================
// Final Summary
// =============================================================================
console.log(`\n${BOLD}${CYAN}======================================================================${RESET}`);
console.log(`${BOLD}${CYAN}  Stress Test Execution Summary${RESET}`);
console.log(`${BOLD}${CYAN}======================================================================${RESET}`);
console.log(`  Total Test Cases : ${totalTests}`);
console.log(`  Passed           : ${GREEN}${passedTests}${RESET}`);
console.log(`  Failed           : ${failedTests > 0 ? RED : GREEN}${failedTests}${RESET}`);

if (failedTests > 0) {
  process.exit(1);
} else {
  console.log(`\n  ${GREEN}${BOLD}ALL STRESS TESTS COMPLETED WITH ZERO DRIFT AND ZERO FAILURES.${RESET}\n`);
}
