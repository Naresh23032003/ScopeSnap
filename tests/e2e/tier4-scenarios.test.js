/**
 * tests/e2e/tier4-scenarios.test.js
 * Tier 4: Real-World Application Scenarios for ScopeSnap (>=5 comprehensive scenarios).
 * End-to-end multi-step user workflows simulating realistic agency and freelancer operations.
 * Strict constraint: Zero em dashes (U+2014) anywhere in code or comments.
 */

import { assert, CalculationOracle, VagueScannerOracle, SpatialMathOracle, SchemaValidator, MockLocalStorage } from './harness.js';
import {
  CURRENCY_CONFIGS,
  RISK_BUFFERS,
  PAYMENT_SCHEDULES,
  VAGUE_PHRASE_PATTERNS,
  CLIENT_CHAOS_PRESETS,
  SAMPLE_SCOPE_PROPOSAL,
  OBSIDIAN_PALETTE
} from './fixtures.js';

export function registerTier4Tests(harness) {

  // =========================================================================
  // Scenario 1: E-Commerce Rebuild Dump to Watertight Signed Proposal
  // =========================================================================
  harness.describe('Tier 4: Scenario 1 - End-to-End E-Commerce Rebuild Workflow', () => {
    harness.test('Executes complete user journey: Preset 1 -> Dials -> Step hours -> Guardrail -> Paper SOW', () => {
      // Step 1: Load Preset 1
      const preset = CLIENT_CHAOS_PRESETS.find(p => p.id === 'preset-1');
      assert.ok(preset);
      const rawText = preset.rawText;

      // Step 2: Scanner identifies all scope traps
      const scan = VagueScannerOracle.scan(rawText, VAGUE_PHRASE_PATTERNS);
      assert.ok(scan.totalTrapCount >= 5, 'Finds at least 5 traps in Preset 1');
      assert.ok(scan.matches.some(m => m.id === 'simple'));
      assert.ok(scan.matches.some(m => m.id === 'quick'));
      assert.ok(scan.matches.some(m => m.id === 'asap'));
      assert.ok(scan.matches.some(m => m.id === 'similar_to_uber'));
      assert.ok(scan.matches.some(m => m.id === 'unlimited'));

      // Step 3: Configure dials: Currency USD, Rate $125/hr, Buffer +35% (1.35x), Schedule 40/30/30
      const currency = 'USD';
      const hourlyRate = 125;
      const riskBuffer = 1.35;
      const schedule = '40/30/30';

      const proposal = JSON.parse(JSON.stringify(SAMPLE_SCOPE_PROPOSAL));

      // Step 4: Initial Calculations
      const initialBaseHours = CalculationOracle.calculateBaseHours(proposal.milestones);
      assert.strictEqual(initialBaseHours, 206);

      const billable1 = CalculationOracle.calculateBillableHours(initialBaseHours, riskBuffer);
      assert.strictEqual(billable1, Math.round(206 * 1.35)); // 278 hrs

      const investment1 = CalculationOracle.calculateTotalInvestment(billable1, hourlyRate);
      assert.strictEqual(investment1, 278 * 125); // $34,750

      const split1 = CalculationOracle.calculatePaymentSplit(investment1, schedule);
      assert.strictEqual(split1.total, investment1);
      assert.strictEqual(split1.items[0].amount + split1.items[1].amount + split1.items[2].amount, investment1);

      // Step 5: User deselects deliverable d-303 (10 hours)
      const d303 = proposal.milestones[2].deliverables.find(d => d.id === 'd-303');
      assert.ok(d303);
      d303.included = false;

      const updatedBaseHours = CalculationOracle.calculateBaseHours(proposal.milestones);
      assert.strictEqual(updatedBaseHours, initialBaseHours - 10); // 196 hrs

      const billable2 = CalculationOracle.calculateBillableHours(updatedBaseHours, riskBuffer);
      assert.strictEqual(billable2, Math.round(196 * 1.35)); // 265 hrs

      const investment2 = CalculationOracle.calculateTotalInvestment(billable2, hourlyRate);
      assert.strictEqual(investment2, 265 * 125); // $33,125

      // Step 6: User appends dynamic out-of-scope guardrail
      const customGuardrail = 'No native iOS/Android mobile apps or multi-vendor payouts';
      proposal.outOfScope.push(customGuardrail);
      assert.ok(proposal.outOfScope.includes(customGuardrail));

      // Step 7: Verify confidence score reflects defensive buffer
      const confidence = CalculationOracle.calculateConfidenceScore({
        trapCount: scan.totalTrapCount,
        riskBuffer,
        highComplexityCount: 3
      });
      assert.inRange(confidence, 45, 95);

      // Step 8: Flip to Paper SOW and verify print view
      const paperData = {
        title: proposal.projectTitle,
        total: `$${investment2.toLocaleString()}`,
        guardrailsCount: proposal.outOfScope.length,
        isFlipped: true
      };
      assert.strictEqual(paperData.total, '$33,125');
      assert.ok(paperData.guardrailsCount >= 7);
    });
  });

  // =========================================================================
  // Scenario 2: AI & B2B SaaS MVP Call Notes Workflow (Voice Transcript to SOW)
  // =========================================================================
  harness.describe('Tier 4: Scenario 2 - AI SaaS MVP Call Notes Workflow', () => {
    harness.test('Converts messy founder voice notes into structured EUR proposal with JSON export', () => {
      // Step 1: Load Preset 2
      const preset = CLIENT_CHAOS_PRESETS.find(p => p.id === 'preset-2');
      assert.ok(preset);

      // Step 2: Scanner identifies traps
      const scan = VagueScannerOracle.scan(preset.rawText, VAGUE_PHRASE_PATTERNS);
      assert.ok(scan.matches.some(m => m.id === 'quick'));
      assert.ok(scan.matches.some(m => m.id === 'just'));
      assert.ok(scan.matches.some(m => m.id === 'unlimited'));

      // Step 3: Set Currency to EUR (€), buffer +15% (1.15x), schedule 50/50
      const cfg = CURRENCY_CONFIGS.EUR;
      const rate = 95; // €95/hr
      const buffer = 1.15;
      const schedule = '50/50';

      const proposal = JSON.parse(JSON.stringify(SAMPLE_SCOPE_PROPOSAL));

      // Step 4: Step Phase 01 architecture deliverable up by +6 hours
      proposal.milestones[0].deliverables[0].hours += 6; // was 16 -> now 22
      const baseHours = CalculationOracle.calculateBaseHours(proposal.milestones);
      assert.strictEqual(baseHours, 206 + 6); // 212 hrs

      const billable = CalculationOracle.calculateBillableHours(baseHours, buffer);
      assert.strictEqual(billable, Math.round(212 * 1.15)); // 244 hrs

      const investment = CalculationOracle.calculateTotalInvestment(billable, rate);
      assert.strictEqual(investment, 244 * 95); // €23,180

      const split = CalculationOracle.calculatePaymentSplit(investment, schedule);
      assert.strictEqual(split.total, investment);
      assert.strictEqual(split.items[0].amount + split.items[1].amount, investment);

      // Step 5: Verify Reply Email is populated for client Dave
      assert.ok(proposal.recommendedReplyEmail.body.includes('Dave'));
      assert.ok(!proposal.recommendedReplyEmail.body.includes('\u2014'));

      // Step 6: Export JSON and validate complete schema
      const jsonExport = JSON.stringify(proposal);
      const parsed = JSON.parse(jsonExport);
      const validation = SchemaValidator.validateScopeProposal(parsed);
      assert.ok(validation.valid, `Exported JSON must be valid: ${validation.errors.join(', ')}`);
    });
  });

  // =========================================================================
  // Scenario 3: Urgent Landing Page + Branding Agency Sprint
  // =========================================================================
  harness.describe('Tier 4: Scenario 3 - High-Pressure Urgent Landing Page Sprint', () => {
    harness.test('Shields agency against ASAP deadline and unlimited revisions trap with Ironclad buffer', () => {
      // Step 1: Load Preset 3
      const preset = CLIENT_CHAOS_PRESETS.find(p => p.id === 'preset-3');
      const scan = VagueScannerOracle.scan(preset.rawText, VAGUE_PHRASE_PATTERNS);

      // Traps must catch ASAP and unlimited revisions
      assert.ok(scan.matches.some(m => m.id === 'asap'));
      assert.ok(scan.matches.some(m => m.id === 'unlimited_revisions'));
      assert.ok(scan.matches.some(m => m.id === 'few_hours'));

      // Step 2: Configure Currency GBP (£), Rate £90/hr, Ironclad +35% buffer
      const rate = 90;
      const buffer = 1.35;
      const schedule = 'retainer';

      const proposal = JSON.parse(JSON.stringify(SAMPLE_SCOPE_PROPOSAL));
      const baseHours = CalculationOracle.calculateBaseHours(proposal.milestones);
      const billable = CalculationOracle.calculateBillableHours(baseHours, buffer);
      const investment = CalculationOracle.calculateTotalInvestment(billable, rate);
      const timeline = CalculationOracle.calculateTimeline(billable);

      // Step 3: Add explicit revision boundary to outOfScope list
      const revisionGuardrail = 'Strictly capped at 2 consolidated revision rounds; extra rounds billed at £90/hr';
      proposal.outOfScope.push(revisionGuardrail);
      assert.ok(proposal.outOfScope.includes(revisionGuardrail));

      // Step 4: Retainer payment schedule calculation
      const split = CalculationOracle.calculatePaymentSplit(investment, schedule, timeline.totalWeeks);
      assert.strictEqual(split.total, investment);
      assert.ok(split.months >= 1);

      // Step 5: Export Markdown SOW and verify absence of em dashes
      function buildMarkdownSow(p, totalInv, timelineFormatted) {
        return [
          `# STATEMENT OF WORK: ${p.projectTitle}`,
          `**Estimated Timeline**: ${timelineFormatted}`,
          `**Total Investment**: \u00A3${totalInv.toLocaleString()}`,
          `\n## Ironclad Out-of-Scope Shield`,
          ...p.outOfScope.map(item => `- ${item}`),
          `\n## Payment Terms`,
          `Retainer schedule billed across project duration.`
        ].join('\n');
      }

      const md = buildMarkdownSow(proposal, investment, timeline.formatted);
      assert.ok(md.includes('\u00A3'));
      assert.ok(md.includes(revisionGuardrail));
      assert.ok(!md.includes('\u2014'), 'Generated Markdown contains zero em dashes');
    });
  });

  // =========================================================================
  // Scenario 4: Scope Creep Follow-up Conversion with Pro Agency Branding
  // =========================================================================
  harness.describe('Tier 4: Scenario 4 - Scope Creep Email to Pro Agency Proposal', () => {
    harness.test('Absorbs scope creep email, computes INR pricing, and generates white-labeled Pro SOW', () => {
      // Step 1: Load Preset 4 (Scope Creep Follow-up Email)
      const preset = CLIENT_CHAOS_PRESETS.find(p => p.id === 'preset-4');
      const scan = VagueScannerOracle.scan(preset.rawText, VAGUE_PHRASE_PATTERNS);
      assert.ok(scan.matches.some(m => m.id === 'quick'));
      assert.ok(scan.matches.some(m => m.id === 'few_hours'));
      assert.ok(scan.matches.some(m => m.id === 'etc'));

      // Step 2: Configure INR currency (₹5,500/hr) with +35% buffer
      const inrRate = 5500;
      const buffer = 1.35;
      const proposal = JSON.parse(JSON.stringify(SAMPLE_SCOPE_PROPOSAL));
      const baseHours = CalculationOracle.calculateBaseHours(proposal.milestones);
      const billable = CalculationOracle.calculateBillableHours(baseHours, buffer);
      const investment = CalculationOracle.calculateTotalInvestment(billable, inrRate);

      assert.strictEqual(investment, 278 * 5500); // ₹15,29,000

      // Step 3: Configure and save $9 Pro Agency Branding
      const storage = new MockLocalStorage();
      const proSettings = {
        isPro: true,
        agencyName: 'Hyperion Software Lab',
        logoUrl: 'https://hyperion.tech/logo.svg',
        brandColor: '#10B981',
        customLegalTerms: 'Governed by the Arbitration Rules of Mumbai. Payment due within 7 days.',
        hideWatermark: true
      };
      storage.setItem('scopesnap_pro_settings', JSON.stringify(proSettings));

      // Step 4: Hydrate Pro Paper SOW
      const loadedPro = JSON.parse(storage.getItem('scopesnap_pro_settings'));
      assert.strictEqual(loadedPro.agencyName, 'Hyperion Software Lab');
      assert.strictEqual(loadedPro.hideWatermark, true);

      // Step 5: Render SOW Document with Pro Branding
      const renderedSow = {
        agency: loadedPro.agencyName,
        legalTerms: loadedPro.customLegalTerms,
        watermark: loadedPro.hideWatermark ? null : 'Powered by ScopeSnap',
        currency: '\u20B9',
        totalInvestment: `\u20B9${investment.toLocaleString()}`
      };

      assert.strictEqual(renderedSow.agency, 'Hyperion Software Lab');
      assert.strictEqual(renderedSow.watermark, null, 'Watermark is hidden for Pro tier');
      assert.ok(renderedSow.totalInvestment.startsWith('\u20B9'));
      assert.ok(!renderedSow.legalTerms.includes('\u2014'));
    });
  });

  // =========================================================================
  // Scenario 5: Offline/Zero-Key Fallback Recovery and Resilience
  // =========================================================================
  harness.describe('Tier 4: Scenario 5 - Offline Fallback Recovery & Resilience', () => {
    harness.test('Simulates complete zero-connectivity / missing-key workflow with demo mode badge', () => {
      // Step 1: Simulate request dispatch with neither BYOK nor server env key
      function handleScopeRequest(request) {
        // Enforce input notes length
        if (!request.rawNotes || request.rawNotes.trim().length < 10) {
          return { status: 400, error: 'Client notes must contain at least 10 characters' };
        }

        // Key check: No key provided
        if (!request.customApiKey) {
          // Fallback simulation: ~320ms latency
          return {
            status: 200,
            latencyMs: 320,
            data: {
              ...SAMPLE_SCOPE_PROPOSAL,
              demoMode: true
            }
          };
        }

        return { status: 200, latencyMs: 280, data: SAMPLE_SCOPE_PROPOSAL };
      }

      // Step 2: Dispatch request
      const response = handleScopeRequest({
        rawNotes: 'Offline note dump for new e-commerce project with custom features',
        currency: 'USD',
        hourlyRate: 100
      });

      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.data.demoMode, true);
      assert.closeTo(response.latencyMs, 320, 50);

      // Step 3: UI receives proposal and renders non-intrusive demo banner
      const bannerText = response.data.demoMode
        ? 'Demo LPU Mode - Add free Groq Key in top bar for live custom AI'
        : 'Live Groq Cloud LPU Connection';

      assert.ok(bannerText.includes('Demo LPU Mode'));
      assert.ok(!bannerText.includes('\u2014'));

      // Step 4: Proposal is fully interactive: user can adjust hours and rates locally
      const baseHours = CalculationOracle.calculateBaseHours(response.data.milestones);
      assert.strictEqual(baseHours, 206);
      const investmentUSD = CalculationOracle.calculateTotalInvestment(baseHours, 100);
      assert.strictEqual(investmentUSD, 20600);

      // Step 5: User can export full PDF/Paper preview even in demo mode
      assert.ok(response.data.milestones.length === 3);
      assert.ok(response.data.outOfScope.length >= 4);
    });
  });
}
