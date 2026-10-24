/**
 * tests/m3-route.test.mjs
 * Route handler verification test suite for POST /api/generate-scope.
 * Tests request validation, key resolution, demo fallback, and response schemas.
 * Strict constraint: Zero em dashes (U+2014) anywhere in code or console outputs.
 */

import assert from "node:assert";
import { NextRequest } from "next/server";
import { POST } from "../app/api/generate-scope/route.ts";
import { ScopeProposalSchema } from "../lib/types.ts";

console.log("======================================================================");
console.log("  ScopeSnap : POST /api/generate-scope Route Handler Verification");
console.log("======================================================================\n");

let passed = 0;
let failed = 0;

async function test(name, fn) {
  try {
    await fn();
    console.log(`  ✓ PASS ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ FAIL ${name}:`, err.message);
    failed++;
  }
}

function createRequest(body, headers = {}) {
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

// -----------------------------------------------------------------------------
// Route Handler Tests
// -----------------------------------------------------------------------------

await test("R1.1: Rejects malformed JSON body with HTTP 400", async () => {
  const req = new NextRequest("http://localhost:3000/api/generate-scope", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "invalid-json{{",
  });
  const res = await POST(req);
  assert.strictEqual(res.status, 400);
  const data = await res.json();
  assert.strictEqual(data.error, "Invalid JSON request body");
});

await test("R1.2: Rejects client notes shorter than 10 characters with HTTP 400", async () => {
  const req = createRequest({ rawNotes: "Short" });
  const res = await POST(req);
  assert.strictEqual(res.status, 400);
  const data = await res.json();
  assert.strictEqual(data.error, "Request validation failed");
  assert.ok(data.details.some((d) => d.includes("at least 10 characters")));
});

await test("R1.3: Returns HTTP 200 with demoMode: true when no API key provided", async () => {
  const req = createRequest({
    rawNotes: "Hey team! We need to rebuild our Shopify store into Next.js with 5000 SKUs ASAP.",
    currency: "USD",
    hourlyRate: 100,
  });
  const res = await POST(req);
  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.strictEqual(data.demoMode, true);
  assert.ok(data.projectTitle.includes("E-Commerce"));
  assert.strictEqual(data.milestones.length, 3);
  assert.ok(data.outOfScope.length >= 4);

  const validated = ScopeProposalSchema.safeParse(data);
  assert.strictEqual(validated.success, true);
});

await test("R1.4: Falls back gracefully to demo proposal if customApiKey fails", async () => {
  const req = createRequest({
    rawNotes: "We need an AI document analysis platform with vector database and PDF indexing.",
    currency: "EUR",
    hourlyRate: 90,
    customApiKey: "gsk_invalid_or_unreachable_key_test_12345",
  });
  const res = await POST(req);
  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.strictEqual(data.demoMode, true);
  assert.ok(data.projectTitle.includes("AI Document"));

  const validated = ScopeProposalSchema.safeParse(data);
  assert.strictEqual(validated.success, true);
});

await test("R1.5: Preserves input notes context for Landing Page preset", async () => {
  const req = createRequest({
    rawNotes: "Need a high-converting 5-page landing page + brand refresh by Friday ASAP! Splines and pitch deck.",
    currency: "GBP",
    hourlyRate: 85,
  });
  const res = await POST(req);
  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.strictEqual(data.demoMode, true);
  assert.ok(data.projectTitle.includes("Landing Page"));
});

await test("R1.6: Preserves input notes context for Auth / RBAC preset", async () => {
  const req = createRequest({
    rawNotes: "While building auth, can we squeeze in social logins, RBAC permission matrices, and 2FA?",
    currency: "INR",
    hourlyRate: 5000,
  });
  const res = await POST(req);
  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.strictEqual(data.demoMode, true);
  assert.ok(data.projectTitle.includes("Auth"));
});

console.log("\n======================================================================");
console.log(`  Route Summary: ${passed} PASSED, ${failed} FAILED`);
console.log("======================================================================\n");

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
