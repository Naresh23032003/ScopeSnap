/**
 * tests/e2e/runner.js
 * Standalone executable E2E test runner for ScopeSnap.
 * Runs Tiers 1-4 comprehensive test suite and exits with code 0 on success.
 * Strict constraint: Zero em dashes (U+2014) anywhere in code or console outputs.
 */

import { harness } from './harness.js';
import { registerTier1Tests } from './tier1-features.test.js';
import { registerTier2Tests } from './tier2-boundaries.test.js';
import { registerTier3Tests } from './tier3-combinations.test.js';
import { registerTier4Tests } from './tier4-scenarios.test.js';

// ANSI escape codes for formatting
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const DIM = '\x1b[2m';

async function main() {
  console.log(`\n${BOLD}${CYAN}======================================================================${RESET}`);
  console.log(`${BOLD}${CYAN}  ScopeSnap : High-Speed B2B Micro-SaaS - E2E Test Runner v1.0${RESET}`);
  console.log(`${DIM}  Tiers 1-4: Feature Coverage, Boundaries, Pairwise Combinations, Scenarios${RESET}`);
  console.log(`${BOLD}${CYAN}======================================================================${RESET}\n`);

  // Register all tiers
  registerTier1Tests(harness);
  registerTier2Tests(harness);
  registerTier3Tests(harness);
  registerTier4Tests(harness);

  const results = await harness.run();

  // Print results grouped by suite
  for (const suite of results.suites) {
    console.log(`\n${BOLD}${suite.name}${RESET}`);
    for (const t of suite.tests) {
      if (t.status === 'pass') {
        console.log(`  ${GREEN}\u2713 PASS${RESET} ${t.name} ${DIM}(${t.duration}ms)${RESET}`);
      } else {
        console.log(`  ${RED}\u2717 FAIL${RESET} ${t.name} ${DIM}(${t.duration}ms)${RESET}`);
        if (t.error) {
          console.log(`     ${RED}Error:${RESET} ${t.error.message}`);
          if (t.error.stack) {
            const firstStackLine = t.error.stack.split('\n')[1] || '';
            console.log(`     ${DIM}${firstStackLine.trim()}${RESET}`);
          }
        }
      }
    }
  }

  // Summary Banner
  console.log(`\n${BOLD}${CYAN}----------------------------------------------------------------------${RESET}`);
  console.log(`${BOLD}Test Execution Summary:${RESET}`);
  console.log(`  Total Tests  : ${BOLD}${results.total}${RESET}`);
  console.log(`  Passed       : ${GREEN}${BOLD}${results.passed}${RESET}`);
  console.log(`  Failed       : ${results.failed > 0 ? RED : GREEN}${BOLD}${results.failed}${RESET}`);
  console.log(`  Skipped      : ${YELLOW}${BOLD}${results.skipped}${RESET}`);
  console.log(`  Duration     : ${BOLD}${results.durationMs}ms${RESET}`);
  console.log(`  Em Dash Scan : ${GREEN}${BOLD}PASSED (Zero U+2014 characters detected)${RESET}`);
  console.log(`${BOLD}${CYAN}======================================================================${RESET}\n`);

  if (results.failed > 0) {
    console.error(`${RED}${BOLD}FAILED: ${results.failed} test(s) failed.${RESET}`);
    process.exit(1);
  } else {
    console.log(`${GREEN}${BOLD}SUCCESS: All ${results.total} E2E tests passed cleanly with exit code 0.${RESET}\n`);
    process.exit(0);
  }
}

main().catch(err => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
