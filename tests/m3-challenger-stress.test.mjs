/**
 * tests/m3-challenger-stress.test.mjs
 * Adversarial empirical stress test suite for ScopeSnap Milestone M3.
 * Targets: POST /api/generate-scope route handler, schema boundaries,
 * latency profiling, demo fallback resilience, and concurrency.
 *
 * Strict constraint: Zero em dashes (U+2014) anywhere in code or console outputs.
 */

import assert from "node:assert";
import { performance } from "node:perf_hooks";
import { NextRequest } from "next/server";
import { POST } from "../app/api/generate-scope/route.ts";
import { ScopeProposalSchema } from "../lib/types.ts";

console.log("======================================================================");
console.log("  ScopeSnap : Empirical Challenger Stress Test Suite (M3)");
console.log("======================================================================\n");

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

function makeRequest(body, headers = {}) {
  const url = "http://localhost:3000/api/generate-scope";
  const init = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: typeof body === "string" ? body : JSON.stringify(body),
  };
  return new NextRequest(url, init);
}

// Ensure no em dashes anywhere in a string or object
function assertNoEmDashes(obj, contextName) {
  const str = typeof obj === "string" ? obj : JSON.stringify(obj);
  assert.ok(
    !str.includes("\u2014"),
    `Em dash (U+2014) detected in ${contextName}`
  );
}

// -----------------------------------------------------------------------------
// SECTION 1: Boundary & Malformed JSON Tests
// -----------------------------------------------------------------------------

await test("SEC1.1: Rejects empty string body with HTTP 400", async () => {
  const req = makeRequest("");
  const res = await POST(req);
  assert.strictEqual(res.status, 400);
  const data = await res.json();
  assert.strictEqual(data.error, "Invalid JSON request body");
});

await test("SEC1.2: Rejects syntax-broken JSON body with HTTP 400", async () => {
  const req = makeRequest('{"rawNotes": "Unfinished json ...');
  const res = await POST(req);
  assert.strictEqual(res.status, 400);
  const data = await res.json();
  assert.strictEqual(data.error, "Invalid JSON request body");
});

await test("SEC1.3: Rejects literal null body with HTTP 400", async () => {
  const req = makeRequest("null");
  const res = await POST(req);
  assert.strictEqual(res.status, 400);
  const data = await res.json();
  assert.strictEqual(data.error, "Invalid JSON request body");
});

await test("SEC1.4: Rejects JSON array body with HTTP 400", async () => {
  const req = makeRequest(JSON.stringify([{ rawNotes: "Valid note length here" }]));
  const res = await POST(req);
  assert.strictEqual(res.status, 400);
  const data = await res.json();
  assert.strictEqual(data.error, "Request validation failed");
});

await test("SEC1.5: Rejects JSON number body with HTTP 400", async () => {
  const req = makeRequest("42");
  const res = await POST(req);
  assert.strictEqual(res.status, 400);
  const data = await res.json();
  assert.strictEqual(data.error, "Invalid JSON request body");
});

await test("SEC1.6: Rejects empty object {} with HTTP 400 (missing rawNotes)", async () => {
  const req = makeRequest({});
  const res = await POST(req);
  assert.strictEqual(res.status, 400);
  const data = await res.json();
  assert.strictEqual(data.error, "Request validation failed");
  assert.ok(data.details.some((d) => d.includes("Required") || d.includes("at least 10 characters")));
});

// -----------------------------------------------------------------------------
// SECTION 2: Boundary Tests for rawNotes (Length & Types)
// -----------------------------------------------------------------------------

await test("SEC2.1: Rejects empty rawNotes string with HTTP 400", async () => {
  const req = makeRequest({ rawNotes: "" });
  const res = await POST(req);
  assert.strictEqual(res.status, 400);
  const data = await res.json();
  assert.ok(data.details.some((d) => d.includes("at least 10 characters")));
});

await test("SEC2.2: Rejects whitespace-only rawNotes (length 9) with HTTP 400", async () => {
  const req = makeRequest({ rawNotes: "         " });
  const res = await POST(req);
  assert.strictEqual(res.status, 400);
  const data = await res.json();
  assert.ok(data.details.some((d) => d.includes("at least 10 characters")));
});

await test("SEC2.3: Rejects rawNotes with exactly 9 characters with HTTP 400", async () => {
  const req = makeRequest({ rawNotes: "123456789" });
  const res = await POST(req);
  assert.strictEqual(res.status, 400);
  const data = await res.json();
  assert.ok(data.details.some((d) => d.includes("at least 10 characters")));
});

await test("SEC2.4: Accepts rawNotes with exactly 10 characters (exact minimum boundary)", async () => {
  const req = makeRequest({ rawNotes: "1234567890" });
  const res = await POST(req);
  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.strictEqual(data.demoMode, true);
  assert.strictEqual(ScopeProposalSchema.safeParse(data).success, true);
});

await test("SEC2.5: Accepts rawNotes with exactly 20,000 characters (exact maximum boundary)", async () => {
  const boundaryNotes = "Need robust scalable platform. ".repeat(645) + "Final words."; // 645*31 + 12 = 20007 -> adjust
  const exactNotes = boundaryNotes.slice(0, 20000);
  assert.strictEqual(exactNotes.length, 20000);

  const req = makeRequest({ rawNotes: exactNotes });
  const res = await POST(req);
  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.strictEqual(data.demoMode, true);
  assert.strictEqual(ScopeProposalSchema.safeParse(data).success, true);
});

await test("SEC2.6: Rejects rawNotes with 20,001 characters (just above maximum boundary)", async () => {
  const oversizedNotes = "A".repeat(20001);
  const req = makeRequest({ rawNotes: oversizedNotes });
  const res = await POST(req);
  assert.strictEqual(res.status, 400);
  const data = await res.json();
  assert.ok(data.details.some((d) => d.includes("cannot exceed 20,000 characters")));
});

await test("SEC2.7: Rejects oversized rawNotes with 50,000 characters with HTTP 400", async () => {
  const massiveNotes = "Spam note content. ".repeat(2600);
  const req = makeRequest({ rawNotes: massiveNotes });
  const res = await POST(req);
  assert.strictEqual(res.status, 400);
  const data = await res.json();
  assert.ok(data.details.some((d) => d.includes("cannot exceed 20,000 characters")));
});

await test("SEC2.8: Rejects non-string rawNotes (number) with HTTP 400", async () => {
  const req = makeRequest({ rawNotes: 9876543210123 });
  const res = await POST(req);
  assert.strictEqual(res.status, 400);
  const data = await res.json();
  assert.strictEqual(data.error, "Request validation failed");
});

await test("SEC2.9: Rejects non-string rawNotes (array) with HTTP 400", async () => {
  const req = makeRequest({ rawNotes: ["Task 1", "Task 2", "Task 3"] });
  const res = await POST(req);
  assert.strictEqual(res.status, 400);
  const data = await res.json();
  assert.strictEqual(data.error, "Request validation failed");
});

// -----------------------------------------------------------------------------
// SECTION 3: Boundary Tests for currency
// -----------------------------------------------------------------------------

await test("SEC3.1: Accepts all 4 supported currencies (USD, INR, EUR, GBP)", async () => {
  const currencies = ["USD", "INR", "EUR", "GBP"];
  for (const curr of currencies) {
    const req = makeRequest({
      rawNotes: "Valid project scoping notes for testing currencies.",
      currency: curr,
    });
    const res = await POST(req);
    assert.strictEqual(res.status, 200, `Expected 200 for currency ${curr}`);
    const data = await res.json();
    assert.strictEqual(data.demoMode, true);
  }
});

await test("SEC3.2: Rejects unsupported currency codes (JPY, CAD, BTC, XYZ) with HTTP 400", async () => {
  const badCurrencies = ["JPY", "CAD", "BTC", "XYZ", "AUD", "CHF"];
  for (const curr of badCurrencies) {
    const req = makeRequest({
      rawNotes: "Valid project scoping notes for testing currencies.",
      currency: curr,
    });
    const res = await POST(req);
    assert.strictEqual(res.status, 400, `Expected 400 for currency ${curr}`);
    const data = await res.json();
    assert.strictEqual(data.error, "Request validation failed");
  }
});

await test("SEC3.3: Rejects lowercase currency codes (usd, inr) with HTTP 400", async () => {
  const req = makeRequest({
    rawNotes: "Valid project scoping notes for testing currencies.",
    currency: "usd",
  });
  const res = await POST(req);
  assert.strictEqual(res.status, 400);
});

await test("SEC3.4: Rejects non-string currency types with HTTP 400", async () => {
  const req = makeRequest({
    rawNotes: "Valid project scoping notes for testing currencies.",
    currency: 100,
  });
  const res = await POST(req);
  assert.strictEqual(res.status, 400);
});

// -----------------------------------------------------------------------------
// SECTION 4: Boundary Tests for hourlyRate
// -----------------------------------------------------------------------------

await test("SEC4.1: Rejects zero hourlyRate (0) with HTTP 400", async () => {
  const req = makeRequest({
    rawNotes: "Valid project scoping notes for testing rates.",
    hourlyRate: 0,
  });
  const res = await POST(req);
  assert.strictEqual(res.status, 400);
  const data = await res.json();
  assert.ok(data.details.some((d) => d.includes("positive number")));
});

await test("SEC4.2: Rejects negative hourlyRate (-50) with HTTP 400", async () => {
  const req = makeRequest({
    rawNotes: "Valid project scoping notes for testing rates.",
    hourlyRate: -50,
  });
  const res = await POST(req);
  assert.strictEqual(res.status, 400);
  const data = await res.json();
  assert.ok(data.details.some((d) => d.includes("positive number")));
});

await test("SEC4.3: Rejects negative float hourlyRate (-0.01) with HTTP 400", async () => {
  const req = makeRequest({
    rawNotes: "Valid project scoping notes for testing rates.",
    hourlyRate: -0.01,
  });
  const res = await POST(req);
  assert.strictEqual(res.status, 400);
  const data = await res.json();
  assert.ok(data.details.some((d) => d.includes("positive number")));
});

await test("SEC4.4: Accepts positive minimum boundary rate (0.01) with HTTP 200", async () => {
  const req = makeRequest({
    rawNotes: "Valid project scoping notes for testing rates.",
    hourlyRate: 0.01,
  });
  const res = await POST(req);
  assert.strictEqual(res.status, 200);
});

await test("SEC4.5: Rejects string hourlyRate ('100') with HTTP 400", async () => {
  const req = makeRequest({
    rawNotes: "Valid project scoping notes for testing rates.",
    hourlyRate: "100",
  });
  const res = await POST(req);
  assert.strictEqual(res.status, 400);
});

// -----------------------------------------------------------------------------
// SECTION 5: API Key Hierarchy & Graceful Fallback
// -----------------------------------------------------------------------------

await test("SEC5.1: Missing customApiKey cleanly defaults to demo mode with demoMode: true", async () => {
  // Ensure GROQ_API_KEY is not set in this test invocation to test key-less branch
  const originalEnv = process.env.GROQ_API_KEY;
  delete process.env.GROQ_API_KEY;

  try {
    const req = makeRequest({
      rawNotes: "We need an e-commerce platform with Shopify integration and catalog sync.",
      currency: "USD",
      hourlyRate: 120,
    });
    const res = await POST(req);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.demoMode, true);
    assert.strictEqual(ScopeProposalSchema.safeParse(data).success, true);
  } finally {
    if (originalEnv) process.env.GROQ_API_KEY = originalEnv;
  }
});

await test("SEC5.2: Whitespace customApiKey ('   ') falls back to demo mode with demoMode: true", async () => {
  const originalEnv = process.env.GROQ_API_KEY;
  delete process.env.GROQ_API_KEY;

  try {
    const req = makeRequest({
      rawNotes: "We need an e-commerce platform with Shopify integration and catalog sync.",
      customApiKey: "    ",
    });
    const res = await POST(req);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.demoMode, true);
  } finally {
    if (originalEnv) process.env.GROQ_API_KEY = originalEnv;
  }
});

await test("SEC5.3: Invalid customApiKey falls back gracefully without 500 error", async () => {
  const req = makeRequest({
    rawNotes: "We need an AI document analysis platform with vector database and PDF indexing.",
    customApiKey: "gsk_completely_fake_adversarial_key_99999",
  });
  const res = await POST(req);
  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.strictEqual(data.demoMode, true);
  assert.ok(data.projectTitle.includes("AI Document"));
});

// -----------------------------------------------------------------------------
// SECTION 6: Demo Fallback Latency Profiling (~320ms Target)
// -----------------------------------------------------------------------------

await test("SEC6.1: Demo fallback latency verification across 5 sequential samples", async () => {
  const latencies = [];
  const originalEnv = process.env.GROQ_API_KEY;
  delete process.env.GROQ_API_KEY;

  try {
    for (let i = 0; i < 5; i++) {
      const req = makeRequest({
        rawNotes: `Sequential performance profiling test sample iteration ${i}: building scalable web app.`,
      });

      const t0 = performance.now();
      const res = await POST(req);
      const t1 = performance.now();

      assert.strictEqual(res.status, 200);
      const elapsed = t1 - t0;
      latencies.push(elapsed);
    }

    const min = Math.min(...latencies);
    const max = Math.max(...latencies);
    const avg = latencies.reduce((a, b) => a + b, 0) / latencies.length;

    console.log(`    Latency Profile: min=${min.toFixed(1)}ms, max=${max.toFixed(1)}ms, avg=${avg.toFixed(1)}ms`);

    // Latency must respect the ~320ms simulated Groq delay: should be at least 300ms, and under 500ms
    assert.ok(
      min >= 300,
      `Minimum latency ${min.toFixed(1)}ms is below the 300ms lower bound for ~320ms simulated delay`
    );
    assert.ok(
      avg < 500,
      `Average latency ${avg.toFixed(1)}ms exceeds the 500ms ceiling for ~320ms simulated delay`
    );
  } finally {
    if (originalEnv) process.env.GROQ_API_KEY = originalEnv;
  }
});

// -----------------------------------------------------------------------------
// SECTION 7: Strict Response Schema & Em Dash Inspection
// -----------------------------------------------------------------------------

await test("SEC7.1: Demo fallback returns all mandatory ScopeProposal fields strictly conforming to schema", async () => {
  const req = makeRequest({
    rawNotes: "We need an e-commerce platform with Shopify migration, 5000 products, and custom checkout.",
  });
  const res = await POST(req);
  assert.strictEqual(res.status, 200);
  const data = await res.json();

  // Validate with Zod
  const validation = ScopeProposalSchema.safeParse(data);
  assert.strictEqual(validation.success, true);

  // Field assertions
  assert.ok(typeof data.projectTitle === "string" && data.projectTitle.length > 0);
  assert.ok(typeof data.clientSummary === "string" && data.clientSummary.length > 0);
  assert.ok(Array.isArray(data.detectedTraps) && data.detectedTraps.length >= 1);
  assert.strictEqual(data.milestones.length, 3);
  assert.ok(Array.isArray(data.outOfScope) && data.outOfScope.length >= 1);
  assert.ok(Array.isArray(data.assumptions) && data.assumptions.length >= 1);
  assert.ok(Array.isArray(data.discoveryQuestions) && data.discoveryQuestions.length >= 1);
  assert.ok(typeof data.recommendedReplyEmail === "object");
  assert.ok(typeof data.recommendedReplyEmail.subject === "string" && data.recommendedReplyEmail.subject.length > 0);
  assert.ok(typeof data.recommendedReplyEmail.body === "string" && data.recommendedReplyEmail.body.length > 0);
  assert.strictEqual(data.demoMode, true);

  // Phase total hours check
  for (const phase of data.milestones) {
    const computedSum = phase.deliverables.reduce(
      (sum, d) => sum + (d.included !== false ? Number(d.hours) || 0 : 0),
      0
    );
    assert.strictEqual(
      phase.phaseTotalHours,
      computedSum,
      `Phase ${phase.phase} subtotal (${phase.phaseTotalHours}) does not match deliverable sum (${computedSum})`
    );
  }

  // Zero em dashes check
  assertNoEmDashes(data, "SEC7.1 Demo Scope Proposal");
});

await test("SEC7.2: Zero em dashes in all 4 preset fallback proposals", async () => {
  const testPhrases = [
    "Shopify e-commerce migration with 5000 SKUs and inventory sync",
    "AI SaaS document indexing with Pinecone vector database and Dave notes",
    "Landing page with brand refresh by Friday ASAP Spline 3D pitch deck",
    "Auth expansion with social login, RBAC permission matrix and 2FA kickoff",
  ];

  for (let i = 0; i < testPhrases.length; i++) {
    const req = makeRequest({ rawNotes: testPhrases[i] });
    const res = await POST(req);
    assert.strictEqual(res.status, 200);
    const data = await res.json();

    assertNoEmDashes(data, `Preset Proposal ${i + 1}`);
  }
});

// -----------------------------------------------------------------------------
// SECTION 8: Concurrency & Stress Load Test
// -----------------------------------------------------------------------------

await test("SEC8.1: Concurrent 8-request burst completes cleanly with zero corruption", async () => {
  const originalEnv = process.env.GROQ_API_KEY;
  delete process.env.GROQ_API_KEY;

  try {
    const promises = Array.from({ length: 8 }, (_, idx) => {
      const req = makeRequest({
        rawNotes: `Concurrent burst client note payload #${idx + 1}: need custom fullstack application.`,
        currency: idx % 2 === 0 ? "USD" : "EUR",
        hourlyRate: 100 + idx * 10,
      });
      return POST(req);
    });

    const responses = await Promise.all(promises);

    for (let i = 0; i < responses.length; i++) {
      const res = responses[i];
      assert.strictEqual(res.status, 200, `Concurrent request #${i + 1} did not return 200`);
      const data = await res.json();
      assert.strictEqual(data.demoMode, true);
      assert.strictEqual(data.milestones.length, 3);
      assert.strictEqual(ScopeProposalSchema.safeParse(data).success, true);
      assertNoEmDashes(data, `Concurrent request #${i + 1} response`);
    }
  } finally {
    if (originalEnv) process.env.GROQ_API_KEY = originalEnv;
  }
});

// -----------------------------------------------------------------------------
// FINAL SUMMARY
// -----------------------------------------------------------------------------

console.log("\n======================================================================");
console.log(`  Empirical Challenger Results: ${passed} PASSED, ${failed} FAILED`);
console.log("======================================================================\n");

if (failed > 0) {
  console.error("Failure details:");
  for (const f of failureDetails) {
    console.error(`  - ${f.name}: ${f.error}`);
  }
  process.exit(1);
} else {
  process.exit(0);
}
