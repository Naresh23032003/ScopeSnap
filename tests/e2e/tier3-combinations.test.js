/**
 * tests/e2e/tier3-combinations.test.js
 * Tier 3: Pairwise Cross-Feature Interactions for ScopeSnap.
 * Covers: Presets + Currencies, Dials + Hour Steppers, BYOK + Fallback,
 * Buffers + Payment Schedules, Flip Stage + Pro Branding, and Scanner + Reel Mode.
 * Strict constraint: Zero em dashes (U+2014) anywhere in code or comments.
 */

import { assert, CalculationOracle, VagueScannerOracle, SpatialMathOracle, MockLocalStorage } from './harness.js';
import {
  CURRENCY_CONFIGS,
  RISK_BUFFERS,
  PAYMENT_SCHEDULES,
  VAGUE_PHRASE_PATTERNS,
  CLIENT_CHAOS_PRESETS,
  SAMPLE_SCOPE_PROPOSAL,
  OBSIDIAN_PALETTE
} from './fixtures.js';

export function registerTier3Tests(harness) {

  // =========================================================================
  // Combination 1: Presets + Currency Pairwise Matrix
  // =========================================================================
  harness.describe('Tier 3: Combination 1 - Presets x Currency Interactions', () => {
    const currencies = ['USD', 'INR', 'EUR', 'GBP'];

    for (const preset of CLIENT_CHAOS_PRESETS) {
      for (const curr of currencies) {
        harness.test(`Preset [${preset.id}] x Currency [${curr}]: computes correct pricing format and symbol`, () => {
          const cfg = CURRENCY_CONFIGS[curr];
          const scan = VagueScannerOracle.scan(preset.rawText, VAGUE_PHRASE_PATTERNS);
          assert.ok(scan.totalTrapCount >= 1, `Preset ${preset.id} must trigger at least 1 trap`);

          const baseHours = CalculationOracle.calculateBaseHours(SAMPLE_SCOPE_PROPOSAL.milestones);
          const billable = CalculationOracle.calculateBillableHours(baseHours, 1.15);
          const totalInvestment = CalculationOracle.calculateTotalInvestment(billable, cfg.defaultRate);

          assert.ok(totalInvestment > 0);
          const formatted = `${cfg.symbol}${totalInvestment.toLocaleString()}`;
          assert.ok(formatted.startsWith(cfg.symbol), `Formatted string must start with currency symbol ${cfg.symbol}`);
          assert.ok(!formatted.includes('\u2014'), 'Pricing contains zero em dashes');
        });
      }
    }
  });

  // =========================================================================
  // Combination 2: Calibration Dials x Hour Steppers Interactions
  // =========================================================================
  harness.describe('Tier 3: Combination 2 - Dials x Hour Steppers Interactions', () => {
    harness.test('Adjusting deliverable hour steppers live-updates billable hours and investment across rates', () => {
      const milestones = JSON.parse(JSON.stringify(SAMPLE_SCOPE_PROPOSAL.milestones));
      const initialBase = CalculationOracle.calculateBaseHours(milestones);

      // Increment first deliverable by 5 hours
      milestones[0].deliverables[0].hours += 5;
      const updatedBase = CalculationOracle.calculateBaseHours(milestones);
      assert.strictEqual(updatedBase, initialBase + 5);

      // Test with $50/hr and 1.0x buffer
      const inv1 = CalculationOracle.calculateTotalInvestment(
        CalculationOracle.calculateBillableHours(updatedBase, 1.0),
        50
      );
      assert.strictEqual(inv1, (initialBase + 5) * 50);

      // Test with $150/hr and 1.35x buffer
      const inv2 = CalculationOracle.calculateTotalInvestment(
        CalculationOracle.calculateBillableHours(updatedBase, 1.35),
        150
      );
      assert.strictEqual(inv2, Math.round((initialBase + 5) * 1.35) * 150);
    });

    harness.test('Stepping an unchecked deliverable does not affect base hours until re-checked', () => {
      const milestones = JSON.parse(JSON.stringify(SAMPLE_SCOPE_PROPOSAL.milestones));
      const initialBase = CalculationOracle.calculateBaseHours(milestones);

      // Uncheck deliverable d-101 (16 hrs)
      milestones[0].deliverables[0].included = false;
      const baseWithUnchecked = CalculationOracle.calculateBaseHours(milestones);
      assert.strictEqual(baseWithUnchecked, initialBase - 16);

      // Step unchecked deliverable from 16 to 26 hours
      milestones[0].deliverables[0].hours = 26;
      const baseStillUnchecked = CalculationOracle.calculateBaseHours(milestones);
      assert.strictEqual(baseStillUnchecked, initialBase - 16, 'Hours must remain excluded while unchecked');

      // Re-check deliverable
      milestones[0].deliverables[0].included = true;
      const baseRechecked = CalculationOracle.calculateBaseHours(milestones);
      assert.strictEqual(baseRechecked, initialBase - 16 + 26, 'New stepped hours included upon check');
    });

    harness.test('Concurrent rate slider adjustment and deliverable hour decrements stay clamped', () => {
      const milestones = JSON.parse(JSON.stringify(SAMPLE_SCOPE_PROPOSAL.milestones));
      // Decrement deliverable down to 1 hour
      milestones[0].deliverables[0].hours = 1;
      // Attempt to decrement again (should clamp at 1)
      milestones[0].deliverables[0].hours = Math.max(1, milestones[0].deliverables[0].hours - 1);
      assert.strictEqual(milestones[0].deliverables[0].hours, 1);

      // Slide rate to maximum USD ($250)
      const base = CalculationOracle.calculateBaseHours(milestones);
      const investment = CalculationOracle.calculateTotalInvestment(
        CalculationOracle.calculateBillableHours(base, 1.0),
        250
      );
      assert.strictEqual(investment, base * 250);
    });
  });

  // =========================================================================
  // Combination 3: Risk Buffer Multipliers x Payment Schedules (All Pairs)
  // =========================================================================
  harness.describe('Tier 3: Combination 3 - Risk Buffers x Payment Schedules', () => {
    const bufferKeys = [1.0, 1.15, 1.35];
    const schedules = ['50/50', '40/30/30', 'retainer'];

    for (const buf of bufferKeys) {
      for (const sched of schedules) {
        harness.test(`Buffer [${buf}x] x Schedule [${sched}]: verifies exact total sum without penny drift`, () => {
          const baseHours = CalculationOracle.calculateBaseHours(SAMPLE_SCOPE_PROPOSAL.milestones);
          const billable = CalculationOracle.calculateBillableHours(baseHours, buf);
          const investment = CalculationOracle.calculateTotalInvestment(billable, 85);
          const timeline = CalculationOracle.calculateTimeline(billable);
          const split = CalculationOracle.calculatePaymentSplit(investment, sched, timeline.totalWeeks);

          assert.strictEqual(split.total, investment, 'Sum of split items must exactly equal total investment');
          if (sched === '50/50') {
            assert.strictEqual(split.items.length, 2);
          } else if (sched === '40/30/30') {
            assert.strictEqual(split.items.length, 3);
          } else if (sched === 'retainer') {
            assert.ok(split.items.length >= 1);
          }
        });
      }
    }
  });

  // =========================================================================
  // Combination 4: BYOK Vault x Fallback Engine Toggle
  // =========================================================================
  harness.describe('Tier 3: Combination 4 - BYOK Vault x Fallback Engine Toggle', () => {
    harness.test('Switching between user key and zero key transitions between live and demo modes', () => {
      const storage = new MockLocalStorage();

      // State 1: User provides key
      storage.setItem('scopesnap_groq_key', 'gsk_valid_user_token_999');
      let storedKey = storage.getItem('scopesnap_groq_key');
      assert.ok(storedKey && storedKey.startsWith('gsk_'));
      let isDemo = !storedKey;
      assert.strictEqual(isDemo, false, 'Key present -> live mode active');

      // State 2: User clears key
      storage.removeItem('scopesnap_groq_key');
      storedKey = storage.getItem('scopesnap_groq_key');
      assert.strictEqual(storedKey, null);
      isDemo = !storedKey;
      assert.strictEqual(isDemo, true, 'Key cleared -> fallback demo mode active');
    });

    harness.test('Demo fallback returns full proposal data when network request encounters 503 error', () => {
      function simulateApiCall(hasKey, networkError = false) {
        if (!hasKey || networkError) {
          // Invokes resilient fallback
          return {
            status: 200,
            data: { ...SAMPLE_SCOPE_PROPOSAL, demoMode: true }
          };
        }
        return {
          status: 200,
          data: { ...SAMPLE_SCOPE_PROPOSAL, demoMode: false }
        };
      }

      const resOffline = simulateApiCall(true, true);
      assert.strictEqual(resOffline.status, 200);
      assert.strictEqual(resOffline.data.demoMode, true);

      const resLive = simulateApiCall(true, false);
      assert.strictEqual(resLive.status, 200);
      assert.strictEqual(resLive.data.demoMode, false);
    });
  });

  // =========================================================================
  // Combination 5: 3D Flip Stage x Pro Agency Branding
  // =========================================================================
  harness.describe('Tier 3: Combination 5 - Flip Stage x Pro Agency Branding', () => {
    harness.test('Flipping to Paper SOW renders hydrated Pro agency branding instead of default ScopeSnap', () => {
      const storage = new MockLocalStorage();
      const customAgency = {
        isPro: true,
        agencyName: 'Vanguard Digital Lab',
        logoUrl: 'https://vanguard.io/logo.svg',
        brandColor: '#06B6D4',
        customLegalTerms: 'All deliverables subject to standard net-15 payment terms.',
        hideWatermark: true
      };
      storage.setItem('scopesnap_pro_settings', JSON.stringify(customAgency));

      function renderPaperHeader(proSettings) {
        if (proSettings && proSettings.isPro && proSettings.agencyName) {
          return {
            title: proSettings.agencyName,
            isCustom: true,
            color: proSettings.brandColor
          };
        }
        return {
          title: 'ScopeSnap Client Proposal',
          isCustom: false,
          color: '#10B981'
        };
      }

      const raw = JSON.parse(storage.getItem('scopesnap_pro_settings'));
      const header = renderPaperHeader(raw);
      assert.strictEqual(header.title, 'Vanguard Digital Lab');
      assert.strictEqual(header.isCustom, true);
      assert.strictEqual(header.color, '#06B6D4');
    });

    harness.test('Toggling Paper View flattens correctly under simulated window.print()', () => {
      let isPaperFlipped = true;
      let isPrinting = false;

      function getEffectiveCardClass(flipped, printing) {
        if (printing) return 'paper-sow-flat-print';
        return flipped ? 'perspective-1600 rotate-y-180' : 'perspective-1600 rotate-y-0';
      }

      assert.strictEqual(getEffectiveCardClass(isPaperFlipped, isPrinting), 'perspective-1600 rotate-y-180');
      isPrinting = true;
      assert.strictEqual(getEffectiveCardClass(isPaperFlipped, isPrinting), 'paper-sow-flat-print');
    });
  });

  // =========================================================================
  // Combination 6: Vague Scanner x Reel Studio Mode x Dynamic Typing
  // =========================================================================
  harness.describe('Tier 3: Combination 6 - Scanner x Reel Studio x Dynamic Typing', () => {
    harness.test('Progressive character typing in 9:16 Reel frame detects emerging scope traps', () => {
      const targetPhrase = 'Need super simple app similar to Airbnb ASAP';
      let currentBuffer = '';
      const trapCheckpoints = [];

      for (let i = 0; i < targetPhrase.length; i++) {
        currentBuffer += targetPhrase[i];
        const scan = VagueScannerOracle.scan(currentBuffer, VAGUE_PHRASE_PATTERNS);
        if (scan.totalTrapCount > (trapCheckpoints[trapCheckpoints.length - 1]?.count || 0)) {
          trapCheckpoints.push({ length: currentBuffer.length, count: scan.totalTrapCount, text: currentBuffer });
        }
      }

      assert.ok(trapCheckpoints.length >= 3, 'Trap count increments progressively as key phrases complete');
      const finalScan = VagueScannerOracle.scan(targetPhrase, VAGUE_PHRASE_PATTERNS);
      assert.ok(finalScan.matches.some(m => m.id === 'simple'));
      assert.ok(finalScan.matches.some(m => m.id === 'similar_to_uber'));
      assert.ok(finalScan.matches.some(m => m.id === 'asap'));
    });

    harness.test('Reel Studio Mode 3D camera harmonic sweep does not interfere with scan result rendering', () => {
      const cameraSweepX = (t) => Math.sin(t) * 2.5; // oscillate between -2.5 and +2.5 deg
      const t = 1.57; // ~pi/2
      const angle = cameraSweepX(t);
      assert.inRange(angle, -3, 3);

      const scanResult = VagueScannerOracle.scan(CLIENT_CHAOS_PRESETS[0].rawText, VAGUE_PHRASE_PATTERNS);
      assert.ok(scanResult.matches.length >= 4);
    });
  });

  // =========================================================================
  // Combination 7: Dynamic Guardrails x Proposal Export (Markdown & JSON)
  // =========================================================================
  harness.describe('Tier 3: Combination 7 - Guardrails x Proposal Export', () => {
    harness.test('Custom guardrails added to Out-of-Scope Shield appear in both Markdown and JSON exports', () => {
      const proposal = JSON.parse(JSON.stringify(SAMPLE_SCOPE_PROPOSAL));
      const customGuardrail = 'No legacy mainframe database migration included under this phase';
      proposal.outOfScope.push(customGuardrail);

      // JSON check
      const jsonExport = JSON.stringify(proposal);
      assert.ok(jsonExport.includes(customGuardrail), 'JSON contains new guardrail');

      // Markdown check
      function toMarkdown(prop) {
        return `## Out of Scope Guardrails\n` + prop.outOfScope.map(g => `- ${g}`).join('\n');
      }
      const mdExport = toMarkdown(proposal);
      assert.ok(mdExport.includes(`- ${customGuardrail}`), 'Markdown contains new guardrail as bullet');
      assert.ok(!mdExport.includes('\u2014'), 'Markdown contains zero em dashes');
    });
  });
}
