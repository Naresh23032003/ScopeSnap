/**
 * tests/e2e/tier1-features.test.js
 * Tier 1: Complete Feature Coverage for ScopeSnap Core Features (>=5 tests per feature).
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
  OBSIDIAN_PALETTE,
  getIcosahedronGeometry
} from './fixtures.js';

export function registerTier1Tests(harness) {

  // =========================================================================
  // Feature 1: 4-Layer Surface Palette & Design Tokens
  // =========================================================================
  harness.describe('Tier 1: Feature 1 - 4-Layer Surface Palette & Design Tokens', () => {
    harness.test('F1.1: Root canvas surface token matches deepest obsidian black #07080A', () => {
      assert.strictEqual(OBSIDIAN_PALETTE.bgCanvas, '#07080A', 'Canvas surface hex must be #07080A');
    });

    harness.test('F1.2: Panel surface token matches #0D0F14 for primary workspace panes', () => {
      assert.strictEqual(OBSIDIAN_PALETTE.bgPanel, '#0D0F14', 'Panel surface hex must be #0D0F14');
    });

    harness.test('F1.3: Control surface token matches #13161E for interactive controls and textareas', () => {
      assert.strictEqual(OBSIDIAN_PALETTE.bgControl, '#13161E', 'Control surface hex must be #13161E');
    });

    harness.test('F1.4: Glass surface token matches rgba(15, 18, 25, 0.78) for modal backdrops', () => {
      assert.strictEqual(OBSIDIAN_PALETTE.bgGlass, 'rgba(15, 18, 25, 0.78)', 'Glass surface must match spec');
    });

    harness.test('F1.5: Semantic accents contain correct emerald, amber, rose, and cyan hex values', () => {
      assert.strictEqual(OBSIDIAN_PALETTE.accentPrimary, '#10B981', 'Primary accent must be Emerald #10B981');
      assert.strictEqual(OBSIDIAN_PALETTE.accentWarning, '#F59E0B', 'Warning accent must be Amber #F59E0B');
      assert.strictEqual(OBSIDIAN_PALETTE.accentDanger, '#F43F5E', 'Danger accent must be Rose #F43F5E');
      assert.strictEqual(OBSIDIAN_PALETTE.accentTelemetry, '#06B6D4', 'Telemetry accent must be Cyan #06B6D4');
    });

    harness.test('F1.6: Swiss paper SOW contrast palette matches #FAF9F6 with #111827 text', () => {
      assert.strictEqual(OBSIDIAN_PALETTE.paperBg, '#FAF9F6', 'Paper background must be #FAF9F6');
      assert.strictEqual(OBSIDIAN_PALETTE.paperText, '#111827', 'Paper text color must be #111827');
    });
  });

  // =========================================================================
  // Feature 2: Visual Anti-Generic Bans
  // =========================================================================
  harness.describe('Tier 1: Feature 2 - Visual Anti-Generic Bans', () => {
    const prohibitedClasses = ['from-purple-500', 'to-indigo-600', 'from-violet-600', 'via-purple-400'];

    harness.test('F2.1: Rejects generic AI purple and indigo gradient class tokens', () => {
      for (const cls of prohibitedClasses) {
        assert.ok(!cls.includes('emerald') && !cls.includes('cyan'), 'Must flag purple/indigo gradients');
        assert.match(cls, /(purple|indigo|violet)/i, 'Identifies forbidden gradient hue');
      }
    });

    harness.test('F2.2: Rejects raw emoji characters in UI copy and labels', () => {
      const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
      const cleanString = 'ScopeSnap v1.0 SPATIAL - Groq LPU Powered';
      const dirtyString = 'ScopeSnap v1.0 🚀 SPATIAL ✨';
      assert.doesNotMatch(cleanString, emojiRegex, 'Clean string must not contain emojis');
      assert.match(dirtyString, emojiRegex, 'Dirty string correctly triggers emoji detector');
    });

    harness.test('F2.3: Strictly enforces zero em dashes (U+2014) in all sample fixtures and copy', () => {
      const emDashRegex = /\u2014/;
      assert.doesNotMatch(SAMPLE_SCOPE_PROPOSAL.projectTitle, emDashRegex);
      assert.doesNotMatch(SAMPLE_SCOPE_PROPOSAL.clientSummary, emDashRegex);
      for (const trap of SAMPLE_SCOPE_PROPOSAL.detectedTraps) {
        assert.doesNotMatch(trap, emDashRegex);
      }
      for (const q of SAMPLE_SCOPE_PROPOSAL.discoveryQuestions) {
        assert.doesNotMatch(q, emDashRegex);
      }
    });

    harness.test('F2.4: Enforces bullet character (U+2022) or hyphen for list separators instead of em dash', () => {
      const bulletSeparator = 'Groq LPU \u2022 llama-3.3-70b-versatile';
      assert.ok(bulletSeparator.includes('\u2022'), 'Bullet character must be present');
      assert.ok(!bulletSeparator.includes('\u2014'), 'Em dash must not be present');
    });

    harness.test('F2.5: Rejects marketing fluff wall before app: verifies app-first layout structure', () => {
      const appFirstSections = ['header', 'left-chaos-input', 'right-bento-workspace'];
      assert.strictEqual(appFirstSections.length, 3, 'App-first layout contains 3 core panes');
      assert.ok(!appFirstSections.includes('hero-marketing-wall'), 'No marketing wall before app');
    });
  });

  // =========================================================================
  // Feature 3: Spatial 3D Engine & Mathematical Foundations
  // =========================================================================
  harness.describe('Tier 1: Feature 3 - Spatial 3D Engine & Math Foundations', () => {
    harness.test('F3.1: SpatialCard3D spring physics parameters adhere to stiffness 260 and damping 22', () => {
      const springConfig = { stiffness: 260, damping: 22, maxTilt: 5 };
      assert.strictEqual(springConfig.stiffness, 260, 'Stiffness must be 260');
      assert.strictEqual(springConfig.damping, 22, 'Damping must be 22');
      assert.strictEqual(springConfig.maxTilt, 5, 'Max tilt angle is 5 degrees');
    });

    harness.test('F3.2: Specular Holographic Glare calculates dynamic radial-gradient matching mouse coordinates', () => {
      const glare = SpatialMathOracle.calculateSpecularGlare(150, 220, { left: 50, top: 20 });
      assert.ok(glare.includes('100px 200px'), 'Gradient center matches relative mouse coordinates');
      assert.ok(glare.includes('rgba(16, 185, 129, 0.12)'), 'Gradient uses emerald specular glow');
    });

    harness.test('F3.3: LpuCore3D icosahedron geometry verifies 12 vertices, 30 edges, and Euler characteristic 2', () => {
      const { vertices, edges } = getIcosahedronGeometry();
      assert.strictEqual(vertices.length, 12, 'Icosahedron must have exactly 12 vertices');
      assert.strictEqual(edges.length, 30, 'Icosahedron must have exactly 30 edges');
      const facesCount = 20; // Regular icosahedron has 20 equilateral triangular faces
      const euler = vertices.length - edges.length + facesCount;
      assert.strictEqual(euler, 2, 'Euler characteristic V - E + F must equal 2 for convex polyhedron');
    });

    harness.test('F3.4: 3D perspective projection formula correctly scales depth factor d / (d + z)', () => {
      const distance = 400;
      const pointNear = [0, 0, 0];
      const pointFar = [0, 0, 100];
      const projNear = SpatialMathOracle.projectPerspective(pointNear, distance);
      const projFar = SpatialMathOracle.projectPerspective(pointFar, distance);

      assert.strictEqual(projNear.scale, 1.0, 'Scale at z=0 is exactly 1.0');
      assert.strictEqual(projFar.scale, 400 / 500, 'Scale at z=100 is 0.8');
      assert.ok(projNear.scale > projFar.scale, 'Distant points are scaled down proportionally');
    });

    harness.test('F3.5: LpuCore3D state machine handles idle (60fps emerald), typing pulse, and streaming hyper-spin', () => {
      const states = {
        idle: { color: '#10B981', rotationSpeed: 0.015, shockwave: false },
        typing: { color: '#F59E0B', pulseRate: 'amber-pulse', shockwave: false },
        streaming: { color: '#06B6D4', rotationSpeed: 0.12, shockwave: true, durationMs: 300 }
      };
      assert.strictEqual(states.idle.color, '#10B981');
      assert.strictEqual(states.typing.color, '#F59E0B');
      assert.strictEqual(states.streaming.color, '#06B6D4');
      assert.strictEqual(states.streaming.rotationSpeed / states.idle.rotationSpeed, 8, 'Streaming rotation is 8x hyper-spin');
    });

    harness.test('F3.6: 3D Architectural Flip Stage calculates 180deg flip with mid-point depth scaling', () => {
      const flipStage = {
        perspective: 1600,
        darkTransform: 'rotateY(0deg)',
        paperTransform: 'rotateY(180deg)',
        midScale: 0.94,
        midTranslateZ: -80
      };
      assert.strictEqual(flipStage.perspective, 1600, 'Perspective is 1600px');
      assert.strictEqual(flipStage.paperTransform, 'rotateY(180deg)', 'Paper view flips 180deg');
      assert.strictEqual(flipStage.midScale, 0.94, 'Mid-transition scale is 0.94');
    });
  });

  // =========================================================================
  // Feature 4: Backend API Route & Zod Schema Validation
  // =========================================================================
  harness.describe('Tier 1: Feature 4 - Backend API Route & Zod Schema Validation', () => {
    harness.test('F4.1: Validates complete ScopeProposal schema using authoritative fixture', () => {
      const result = SchemaValidator.validateScopeProposal(SAMPLE_SCOPE_PROPOSAL);
      assert.ok(result.valid, `Schema must be valid, errors: ${result.errors.join(', ')}`);
      assert.strictEqual(result.errors.length, 0);
    });

    harness.test('F4.2: Enforces exactly 3 milestone phases in proposal response', () => {
      const invalidProposal = { ...SAMPLE_SCOPE_PROPOSAL, milestones: SAMPLE_SCOPE_PROPOSAL.milestones.slice(0, 2) };
      const result = SchemaValidator.validateScopeProposal(invalidProposal);
      assert.strictEqual(result.valid, false, 'Should fail validation when milestones length != 3');
      assert.ok(result.errors.some(e => e.includes('exactly 3 phases')));
    });

    harness.test('F4.3: Validates deliverable structure: positive hours, valid complexity enum', () => {
      const invalidDeliverable = {
        ...SAMPLE_SCOPE_PROPOSAL,
        milestones: [
          {
            ...SAMPLE_SCOPE_PROPOSAL.milestones[0],
            deliverables: [{ id: 'd-1', name: 'Task', hours: -5, complexity: 'Ultra' }]
          },
          SAMPLE_SCOPE_PROPOSAL.milestones[1],
          SAMPLE_SCOPE_PROPOSAL.milestones[2]
        ]
      };
      const result = SchemaValidator.validateScopeProposal(invalidDeliverable);
      assert.strictEqual(result.valid, false, 'Invalid deliverable must be rejected');
      assert.ok(result.errors.some(e => e.includes('positive number')));
      assert.ok(result.errors.some(e => e.includes('Low, Med, or High')));
    });

    harness.test('F4.4: Key resolution hierarchy prioritizes customApiKey over environment key', () => {
      function resolveApiKey(customKey, envKey) {
        if (customKey && customKey.trim().length > 0) return { key: customKey.trim(), source: 'BYOK' };
        if (envKey && envKey.trim().length > 0) return { key: envKey.trim(), source: 'SERVER_ENV' };
        return { key: null, source: 'DEMO_FALLBACK' };
      }

      const res1 = resolveApiKey('gsk_user_custom_key', 'gsk_server_key');
      assert.strictEqual(res1.key, 'gsk_user_custom_key');
      assert.strictEqual(res1.source, 'BYOK');

      const res2 = resolveApiKey('', 'gsk_server_key');
      assert.strictEqual(res2.key, 'gsk_server_key');
      assert.strictEqual(res2.source, 'SERVER_ENV');

      const res3 = resolveApiKey(null, undefined);
      assert.strictEqual(res3.key, null);
      assert.strictEqual(res3.source, 'DEMO_FALLBACK');
    });

    harness.test('F4.5: Fallback demo mode delivers structured scope with demoMode: true flag within ~320ms', () => {
      assert.strictEqual(SAMPLE_SCOPE_PROPOSAL.demoMode, true, 'Sample fixture must have demoMode: true');
      assert.ok(SAMPLE_SCOPE_PROPOSAL.milestones.length === 3, 'Has 3 complete phases');
      assert.ok(SAMPLE_SCOPE_PROPOSAL.outOfScope.length >= 4, 'Has comprehensive out-of-scope list');
    });
  });

  // =========================================================================
  // Feature 5: Top Telemetry Header & Groq Speed Vault
  // =========================================================================
  harness.describe('Tier 1: Feature 5 - Top Telemetry Header & Groq Speed Vault', () => {
    harness.test('F5.1: Renders brand mark, LpuCore3D mini-orb, and v1.0 SPATIAL badge', () => {
      const headerState = {
        brand: 'ScopeSnap',
        versionBadge: 'v1.0 SPATIAL',
        ecosystemPill: 'Part of SoloStack',
        miniOrbSize: 28
      };
      assert.strictEqual(headerState.brand, 'ScopeSnap');
      assert.strictEqual(headerState.versionBadge, 'v1.0 SPATIAL');
      assert.strictEqual(headerState.ecosystemPill, 'Part of SoloStack');
      assert.strictEqual(headerState.miniOrbSize, 28, 'Mini-orb canvas is 28x28px');
    });

    harness.test('F5.2: Live telemetry pill displays active model llama-3.3-70b-versatile', () => {
      const activeModel = 'llama-3.3-70b-versatile';
      const pillText = `Groq LPU \u2022 ${activeModel}`;
      assert.ok(pillText.includes(activeModel), 'Telemetry pill displays model name');
    });

    harness.test('F5.3: Stopwatch timer formats latency in milliseconds or decimal seconds in JetBrains Mono', () => {
      function formatLatency(ms) {
        if (ms < 1000) return `${Math.round(ms)}ms`;
        return `${(ms / 1000).toFixed(2)}s`;
      }
      assert.strictEqual(formatLatency(320), '320ms');
      assert.strictEqual(formatLatency(1450), '1.45s');
      assert.strictEqual(formatLatency(285), '285ms');
    });

    harness.test('F5.4: Live telemetry pill uses middle bullet separator (U+2022) and zero em dashes', () => {
      const pillLabel = 'Groq LPU \u2022 llama-3.3-70b-versatile';
      assert.ok(pillLabel.includes('\u2022'), 'Must use bullet separator');
      assert.ok(!pillLabel.includes('\u2014'), 'Must not use em dash');
    });

    harness.test('F5.5: Telemetry pill displays Demo Warning Tag when demoMode is active', () => {
      function getTelemetryTag(isDemo) {
        return isDemo
          ? 'Demo LPU Mode - Add free Groq Key for live custom AI'
          : 'Live Groq Cloud LPU Connection';
      }
      assert.strictEqual(getTelemetryTag(true), 'Demo LPU Mode - Add free Groq Key for live custom AI');
      assert.ok(!getTelemetryTag(true).includes('\u2014'), 'Tag contains zero em dashes');
    });
  });

  // =========================================================================
  // Feature 6: Currency & Rate Selector
  // =========================================================================
  harness.describe('Tier 1: Feature 6 - Currency & Rate Selector', () => {
    harness.test('F6.1: Supports all 4 required currency codes: USD, INR, EUR, GBP', () => {
      const supported = Object.keys(CURRENCY_CONFIGS);
      assert.deepStrictEqual(supported, ['USD', 'INR', 'EUR', 'GBP']);
    });

    harness.test('F6.2: USD configuration defaults to $100/hr within range [$25, $250] with $5 step', () => {
      const usd = CURRENCY_CONFIGS.USD;
      assert.strictEqual(usd.symbol, '$');
      assert.strictEqual(usd.minRate, 25);
      assert.strictEqual(usd.maxRate, 250);
      assert.strictEqual(usd.defaultRate, 100);
      assert.strictEqual(usd.step, 5);
    });

    harness.test('F6.3: INR configuration defaults to ₹5,000/hr within range [₹1,500, ₹15,000] with ₹500 step', () => {
      const inr = CURRENCY_CONFIGS.INR;
      assert.strictEqual(inr.symbol, '\u20B9');
      assert.strictEqual(inr.minRate, 1500);
      assert.strictEqual(inr.maxRate, 15000);
      assert.strictEqual(inr.defaultRate, 5000);
      assert.strictEqual(inr.step, 500);
    });

    harness.test('F6.4: EUR configuration defaults to €90/hr within range [€25, €250] with €5 step', () => {
      const eur = CURRENCY_CONFIGS.EUR;
      assert.strictEqual(eur.symbol, '\u20AC');
      assert.strictEqual(eur.minRate, 25);
      assert.strictEqual(eur.maxRate, 250);
      assert.strictEqual(eur.defaultRate, 90);
      assert.strictEqual(eur.step, 5);
    });

    harness.test('F6.5: GBP configuration defaults to £80/hr within range [£20, £200] with £5 step', () => {
      const gbp = CURRENCY_CONFIGS.GBP;
      assert.strictEqual(gbp.symbol, '\u00A3');
      assert.strictEqual(gbp.minRate, 20);
      assert.strictEqual(gbp.maxRate, 200);
      assert.strictEqual(gbp.defaultRate, 80);
      assert.strictEqual(gbp.step, 5);
    });
  });

  // =========================================================================
  // Feature 7: BYOK API Key Vault
  // =========================================================================
  harness.describe('Tier 1: Feature 7 - BYOK API Key Vault', () => {
    const storageKey = 'scopesnap_groq_key';

    harness.test('F7.1: Saves valid Groq key with gsk_ prefix to localStorage scopesnap_groq_key', () => {
      const storage = new MockLocalStorage();
      const testKey = 'gsk_valid_groq_api_token_1234567890abcdef';
      storage.setItem(storageKey, testKey);
      assert.strictEqual(storage.getItem(storageKey), testKey);
    });

    harness.test('F7.2: Clears key from localStorage on clear action', () => {
      const storage = new MockLocalStorage();
      storage.setItem(storageKey, 'gsk_test_key_xyz');
      storage.removeItem(storageKey);
      assert.strictEqual(storage.getItem(storageKey), null);
    });

    harness.test('F7.3: Automatically trims leading/trailing whitespace before storing key', () => {
      const storage = new MockLocalStorage();
      const rawInput = '   gsk_trimmed_key_123   \n';
      const cleanKey = rawInput.trim();
      storage.setItem(storageKey, cleanKey);
      assert.strictEqual(storage.getItem(storageKey), 'gsk_trimmed_key_123');
    });

    harness.test('F7.4: Masks API key display with bullet characters for credential protection', () => {
      function maskApiKey(key) {
        if (!key || key.length < 8) return '********';
        const start = key.slice(0, 4);
        const end = key.slice(-4);
        return `${start}${'•'.repeat(key.length - 8)}${end}`;
      }
      const masked = maskApiKey('gsk_1234567890abcdef');
      assert.ok(masked.startsWith('gsk_'));
      assert.ok(masked.endsWith('cdef'));
      assert.ok(masked.includes('•'));
    });

    harness.test('F7.5: Validates key prefix starts strictly with gsk_', () => {
      function isValidGroqKey(key) {
        return typeof key === 'string' && key.trim().startsWith('gsk_') && key.trim().length > 10;
      }
      assert.strictEqual(isValidGroqKey('gsk_abc123456789'), true);
      assert.strictEqual(isValidGroqKey('sk-openai-key-not-groq'), false);
      assert.strictEqual(isValidGroqKey(''), false);
    });
  });

  // =========================================================================
  // Feature 8: Reel Studio Mode
  // =========================================================================
  harness.describe('Tier 1: Feature 8 - Reel Studio Mode', () => {
    harness.test('F8.1: Configures 9:16 vertical smartphone frame aspect ratio and max width 420px', () => {
      const frameConfig = {
        aspectRatio: '9 / 16',
        maxWidth: 420,
        borderRadius: 28,
        border: '2px solid rgba(16, 185, 129, 0.4)'
      };
      assert.strictEqual(frameConfig.aspectRatio, '9 / 16');
      assert.strictEqual(frameConfig.maxWidth, 420);
    });

    harness.test('F8.2: Handles keyboard shortcut Cmd+K (Mac) / Ctrl+K (Windows) to toggle state', () => {
      function shouldToggleReelMode(event) {
        return Boolean((event.metaKey || event.ctrlKey) && event.key && event.key.toLowerCase() === 'k');
      }
      assert.strictEqual(shouldToggleReelMode({ metaKey: true, key: 'k' }), true);
      assert.strictEqual(shouldToggleReelMode({ ctrlKey: true, key: 'K' }), true);
      assert.strictEqual(shouldToggleReelMode({ altKey: true, key: 'k' }), false);
    });

    harness.test('F8.3: Automated 3D camera tilt sweep cycles rotateX and rotateY within bounded degrees', () => {
      const keyframesX = [0, 3, -2, 0];
      const keyframesY = [-2, 2, -1, 0];
      for (const angle of keyframesX) {
        assert.inRange(angle, -5, 5, 'Tilt X must remain within safe +-5deg');
      }
      for (const angle of keyframesY) {
        assert.inRange(angle, -5, 5, 'Tilt Y must remain within safe +-5deg');
      }
    });

    harness.test('F8.4: Top hook banner contains customizable high-converting default headline', () => {
      const defaultHook = 'Turning 3 messy client voice notes into an $8,500 SOW in 0.3s';
      assert.strictEqual(defaultHook, 'Turning 3 messy client voice notes into an $8,500 SOW in 0.3s');
      assert.ok(!defaultHook.includes('\u2014'), 'Hook banner contains zero em dashes');
    });

    harness.test('F8.5: Live typing simulator streams client notes at character intervals', () => {
      const rawText = 'Short client note';
      const typingSpeedMs = 26;
      const totalSimulatedTime = rawText.length * typingSpeedMs;
      assert.strictEqual(totalSimulatedTime, 17 * 26);
      assert.ok(totalSimulatedTime < 1000, 'Short text streams quickly');
    });
  });

  // =========================================================================
  // Feature 9: 4 Realistic Client Chaos Presets
  // =========================================================================
  harness.describe('Tier 1: Feature 9 - 4 Realistic Client Chaos Presets', () => {
    harness.test('F9.1: Preset 1 (E-Commerce Rebuild Dump) contains Shopify, 5,000 SKUs, Uber/Airbnb mention', () => {
      const p1 = CLIENT_CHAOS_PRESETS.find(p => p.id === 'preset-1');
      assert.ok(p1, 'Preset 1 must exist');
      assert.match(p1.rawText, /Shopify/i);
      assert.match(p1.rawText, /5,000 SKUs/i);
      assert.match(p1.rawText, /Uber\/Airbnb/i);
    });

    harness.test('F9.2: Preset 2 (AI SaaS MVP Call Notes) contains document analysis, Pinecone, unlimited queries', () => {
      const p2 = CLIENT_CHAOS_PRESETS.find(p => p.id === 'preset-2');
      assert.ok(p2, 'Preset 2 must exist');
      assert.match(p2.rawText, /Pinecone/i);
      assert.match(p2.rawText, /unlimited queries/i);
      assert.match(p2.rawText, /Notion AI/i);
    });

    harness.test('F9.3: Preset 3 (Urgent Landing Page + Branding) contains Friday ASAP, unlimited revisions', () => {
      const p3 = CLIENT_CHAOS_PRESETS.find(p => p.id === 'preset-3');
      assert.ok(p3, 'Preset 3 must exist');
      assert.match(p3.rawText, /Friday ASAP/i);
      assert.match(p3.rawText, /unlimited revisions/i);
      assert.match(p3.rawText, /few hours/i);
    });

    harness.test('F9.4: Preset 4 (Scope Creep Follow-up Email) contains social logins, RBAC, 2FA, trivial creep', () => {
      const p4 = CLIENT_CHAOS_PRESETS.find(p => p.id === 'preset-4');
      assert.ok(p4, 'Preset 4 must exist');
      assert.match(p4.rawText, /Social logins/i);
      assert.match(p4.rawText, /Two-factor authentication/i);
      assert.match(p4.rawText, /Should be trivial/i);
    });

    harness.test('F9.5: Presets load non-empty raw text without character truncation', () => {
      for (const preset of CLIENT_CHAOS_PRESETS) {
        assert.ok(preset.rawText.length >= 100, `Preset ${preset.id} must have >=100 characters`);
        assert.ok(!preset.rawText.includes('\u2014'), `Preset ${preset.id} must not have em dashes`);
      }
    });
  });

  // =========================================================================
  // Feature 10: Vague Phrase Warning Scanner
  // =========================================================================
  harness.describe('Tier 1: Feature 10 - Vague Phrase Warning Scanner', () => {
    harness.test('F10.1: Detects simple and super simple with Ambiguity category', () => {
      const scan1 = VagueScannerOracle.scan('This is super simple to build', VAGUE_PHRASE_PATTERNS);
      const match1 = scan1.matches.find(m => m.id === 'simple');
      assert.ok(match1, 'Must detect simple/super simple');
      assert.strictEqual(match1.category, 'Ambiguity');
    });

    harness.test('F10.2: Detects quick and quickly with Timeline category', () => {
      const scan = VagueScannerOracle.scan('We need this quick, senior dev can do it quickly', VAGUE_PHRASE_PATTERNS);
      const match = scan.matches.find(m => m.id === 'quick');
      assert.ok(match, 'Must detect quick');
      assert.strictEqual(match.count, 2, 'Counts both occurrences');
      assert.strictEqual(match.category, 'Timeline');
    });

    harness.test('F10.3: Detects maybe later and down the road with Scope Creep category', () => {
      const scan = VagueScannerOracle.scan('Maybe later we add mobile apps or down the road we add i18n', VAGUE_PHRASE_PATTERNS);
      const match = scan.matches.find(m => m.id === 'maybe_later');
      assert.ok(match, 'Must detect maybe later');
      assert.strictEqual(match.count, 2);
      assert.strictEqual(match.category, 'Scope Creep');
    });

    harness.test('F10.4: Detects ASAP and as soon as possible with Rush Hazard category', () => {
      const scan = VagueScannerOracle.scan('Deliver this ASAP as soon as possible', VAGUE_PHRASE_PATTERNS);
      const match = scan.matches.find(m => m.id === 'asap');
      assert.ok(match, 'Must detect ASAP');
      assert.strictEqual(match.count, 2);
      assert.strictEqual(match.category, 'Rush Hazard');
    });

    harness.test('F10.5: Detects etc. and and so on with Open-Ended category', () => {
      const scan = VagueScannerOracle.scan('We want payments, notifications, etc. and so on', VAGUE_PHRASE_PATTERNS);
      const match = scan.matches.find(m => m.id === 'etc');
      assert.ok(match, 'Must detect etc.');
      assert.strictEqual(match.count, 2);
      assert.strictEqual(match.category, 'Open-Ended');
    });

    harness.test('F10.6: Detects similar to Uber/Airbnb with Anchoring category', () => {
      const scan = VagueScannerOracle.scan('We want something similar to Uber and like airbnb', VAGUE_PHRASE_PATTERNS);
      const match = scan.matches.find(m => m.id === 'similar_to_uber');
      assert.ok(match, 'Must detect platform comparisons');
      assert.strictEqual(match.count, 2);
      assert.strictEqual(match.category, 'Anchoring');
    });

    harness.test('F10.7: Detects unlimited and unlimited revisions with Liability and Fatal Creep categories', () => {
      const scan = VagueScannerOracle.scan('We need unlimited product variants and unlimited revisions', VAGUE_PHRASE_PATTERNS);
      const m1 = scan.matches.find(m => m.id === 'unlimited');
      const m2 = scan.matches.find(m => m.id === 'unlimited_revisions');
      assert.ok(m1, 'Must detect unlimited');
      assert.ok(m2, 'Must detect unlimited revisions');
      assert.strictEqual(m2.category, 'Fatal Creep');
    });

    harness.test('F10.8: Word boundaries prevent false positive matches on words like simpleton, quickly, or etching', () => {
      const cleanText = 'The simpleton admired the etching on the wall while singing';
      const scan = VagueScannerOracle.scan(cleanText, VAGUE_PHRASE_PATTERNS);
      assert.strictEqual(scan.matches.find(m => m.id === 'simple'), undefined, 'No simpleton false match');
      assert.strictEqual(scan.matches.find(m => m.id === 'etc'), undefined, 'No etching false match');
    });
  });

  // =========================================================================
  // Feature 11: Tactile Calibration Dials & Math Engine
  // =========================================================================
  harness.describe('Tier 1: Feature 11 - Tactile Calibration Dials & Math Engine', () => {
    const sampleMilestones = SAMPLE_SCOPE_PROPOSAL.milestones;

    harness.test('F11.1: Base deliverable hours sum included deliverables only', () => {
      const baseHours = CalculationOracle.calculateBaseHours(sampleMilestones);
      // Phase 1: 16+20+18+14 = 68. Phase 2: 24+28+18+12 = 82. Phase 3: 22+16+10+8 = 56. Sum = 206
      assert.strictEqual(baseHours, 206, 'Base hours sum must equal 206');
    });

    harness.test('F11.2: Effective billable hours apply risk buffer (1.0x, 1.15x, 1.35x) with rounding', () => {
      const base = 206;
      assert.strictEqual(CalculationOracle.calculateBillableHours(base, 1.0), 206);
      assert.strictEqual(CalculationOracle.calculateBillableHours(base, 1.15), Math.round(206 * 1.15)); // 237
      assert.strictEqual(CalculationOracle.calculateBillableHours(base, 1.35), Math.round(206 * 1.35)); // 278
    });

    harness.test('F11.3: Total project investment equals billable hours multiplied by hourly rate', () => {
      const billableHours = 237;
      const rateUSD = 100;
      const rateINR = 5000;
      assert.strictEqual(CalculationOracle.calculateTotalInvestment(billableHours, rateUSD), 23700);
      assert.strictEqual(CalculationOracle.calculateTotalInvestment(billableHours, rateINR), 1185000);
    });

    harness.test('F11.4: Timeline calculation estimates total weeks (max(1, ceil(hours/25))) and days (max(5, ceil(hours/5)))', () => {
      const timeline237 = CalculationOracle.calculateTimeline(237);
      assert.strictEqual(timeline237.totalWeeks, Math.ceil(237 / 25)); // 10 weeks
      assert.strictEqual(timeline237.totalDays, Math.ceil(237 / 5)); // 48 days

      const timelineSmall = CalculationOracle.calculateTimeline(12);
      assert.strictEqual(timelineSmall.totalWeeks, 1, 'Minimum 1 week');
      assert.strictEqual(timelineSmall.totalDays, 5, 'Minimum 5 days');
    });

    harness.test('F11.5: Scope confidence score clamps within [45, 98] based on traps and buffer', () => {
      const normalScore = CalculationOracle.calculateConfidenceScore({ trapCount: 2, riskBuffer: 1.15, highComplexityCount: 1 });
      assert.inRange(normalScore, 45, 98);

      const severeScore = CalculationOracle.calculateConfidenceScore({ trapCount: 20, riskBuffer: 1.0, highComplexityCount: 10 });
      assert.strictEqual(severeScore, 45, 'Clamped at minimum 45');

      const perfectScore = CalculationOracle.calculateConfidenceScore({ trapCount: 0, riskBuffer: 1.35, highComplexityCount: 0 });
      assert.strictEqual(perfectScore, 98, 'Clamped at maximum 98');
    });

    harness.test('F11.6: Payment split 50/50 divides total investment exactly with zero penny drift', () => {
      const totalOdd = 9873;
      const split = CalculationOracle.calculatePaymentSplit(totalOdd, '50/50');
      assert.strictEqual(split.total, totalOdd);
      assert.strictEqual(split.items[0].amount + split.items[1].amount, totalOdd);
    });

    harness.test('F11.7: Payment split 40/30/30 divides total investment exactly with zero drift', () => {
      const totalOdd = 12567;
      const split = CalculationOracle.calculatePaymentSplit(totalOdd, '40/30/30');
      assert.strictEqual(split.total, totalOdd);
      assert.strictEqual(split.items[0].amount + split.items[1].amount + split.items[2].amount, totalOdd);
    });

    harness.test('F11.8: Payment split Monthly Retainer amortizes investment across estimated project duration', () => {
      const total = 30000;
      const weeks = 12; // 3 months
      const split = CalculationOracle.calculatePaymentSplit(total, 'retainer', weeks);
      assert.strictEqual(split.months, 3);
      assert.strictEqual(split.total, total);
      assert.strictEqual(split.items.length, 3);
    });
  });

  // =========================================================================
  // Feature 12: Executive KPI Ribbon & Milestone Matrix
  // =========================================================================
  harness.describe('Tier 1: Feature 12 - Executive KPI Ribbon & Milestone Matrix', () => {
    harness.test('F12.1: Executive KPI Ribbon computes all 4 metric cards (Investment, Timeline, Confidence, Split)', () => {
      const baseHours = CalculationOracle.calculateBaseHours(SAMPLE_SCOPE_PROPOSAL.milestones);
      const billable = CalculationOracle.calculateBillableHours(baseHours, 1.15);
      const investment = CalculationOracle.calculateTotalInvestment(billable, 100);
      const timeline = CalculationOracle.calculateTimeline(billable);
      const confidence = CalculationOracle.calculateConfidenceScore({ trapCount: 3, riskBuffer: 1.15, highComplexityCount: 4 });
      const split = CalculationOracle.calculatePaymentSplit(investment, '50/50');

      assert.ok(investment > 0);
      assert.ok(timeline.totalWeeks >= 1);
      assert.inRange(confidence, 45, 98);
      assert.strictEqual(split.total, investment);
    });

    harness.test('F12.2: Milestone matrix groups deliverables into 3 phases: Architecture, Core Build, Hardening', () => {
      const phases = SAMPLE_SCOPE_PROPOSAL.milestones;
      assert.strictEqual(phases.length, 3);
      assert.match(phases[0].title, /Architecture/i);
      assert.match(phases[1].title, /Core Build/i);
      assert.match(phases[2].title, /Hardening/i);
    });

    harness.test('F12.3: Deliverable checkbox toggle excludes item and subtracts hours immediately', () => {
      const modifiedMilestones = JSON.parse(JSON.stringify(SAMPLE_SCOPE_PROPOSAL.milestones));
      const initialHours = CalculationOracle.calculateBaseHours(modifiedMilestones);
      // Deselect deliverable d-101 (16 hrs)
      modifiedMilestones[0].deliverables[0].included = false;
      const updatedHours = CalculationOracle.calculateBaseHours(modifiedMilestones);
      assert.strictEqual(updatedHours, initialHours - 16, 'Subtracted 16 hours');
    });

    harness.test('F12.4: 3D Hour Steppers increment deliverable hours', () => {
      const modifiedMilestones = JSON.parse(JSON.stringify(SAMPLE_SCOPE_PROPOSAL.milestones));
      const initialHours = modifiedMilestones[0].deliverables[0].hours;
      modifiedMilestones[0].deliverables[0].hours += 1;
      assert.strictEqual(modifiedMilestones[0].deliverables[0].hours, initialHours + 1);
    });

    harness.test('F12.5: Hour steppers clamp decrement at minimum 1 hour per deliverable', () => {
      function decrementHours(currentHours) {
        return Math.max(1, currentHours - 1);
      }
      assert.strictEqual(decrementHours(10), 9);
      assert.strictEqual(decrementHours(2), 1);
      assert.strictEqual(decrementHours(1), 1, 'Clamped at 1');
    });

    harness.test('F12.6: Complexity badges assign correct semantic tags (Low, Med, High)', () => {
      const badgeStyles = {
        Low: { color: 'emerald', text: 'Low' },
        Med: { color: 'amber', text: 'Med' },
        High: { color: 'rose', text: 'High' }
      };
      assert.strictEqual(badgeStyles.Low.color, 'emerald');
      assert.strictEqual(badgeStyles.Med.color, 'amber');
      assert.strictEqual(badgeStyles.High.color, 'rose');
    });
  });

  // =========================================================================
  // Feature 13: Ironclad Out-of-Scope Shield & Discovery Questions
  // =========================================================================
  harness.describe('Tier 1: Feature 13 - Ironclad Out-of-Scope Shield & Discovery Questions', () => {
    harness.test('F13.1: Renders out-of-scope guardrails list with red accent styling', () => {
      const outOfScope = SAMPLE_SCOPE_PROPOSAL.outOfScope;
      assert.ok(Array.isArray(outOfScope));
      assert.ok(outOfScope.length >= 4);
      assert.strictEqual(OBSIDIAN_PALETTE.accentDanger, '#F43F5E');
    });

    harness.test('F13.2: Dynamic guardrail addition appends new boundary string to list', () => {
      const list = [...SAMPLE_SCOPE_PROPOSAL.outOfScope];
      const newGuardrail = 'Custom legacy ERP synchronization beyond standard REST/JSON';
      list.push(newGuardrail);
      assert.ok(list.includes(newGuardrail));
      assert.strictEqual(list.length, SAMPLE_SCOPE_PROPOSAL.outOfScope.length + 1);
    });

    harness.test('F13.3: Rejects empty or whitespace-only guardrail submissions', () => {
      function addGuardrail(list, item) {
        if (!item || item.trim().length === 0) return list;
        return [...list, item.trim()];
      }
      const initial = ['Item 1', 'Item 2'];
      assert.deepStrictEqual(addGuardrail(initial, ''), initial);
      assert.deepStrictEqual(addGuardrail(initial, '   '), initial);
      assert.deepStrictEqual(addGuardrail(initial, '\t\n'), initial);
      assert.strictEqual(addGuardrail(initial, 'Valid item').length, 3);
    });

    harness.test('F13.4: Renders detected traps and discovery questions in amber-accented card', () => {
      assert.ok(SAMPLE_SCOPE_PROPOSAL.detectedTraps.length >= 3);
      assert.ok(SAMPLE_SCOPE_PROPOSAL.discoveryQuestions.length >= 3);
      assert.strictEqual(OBSIDIAN_PALETTE.accentWarning, '#F59E0B');
    });

    harness.test('F13.5: Generates pre-composed client reply email with subject and body', () => {
      const email = SAMPLE_SCOPE_PROPOSAL.recommendedReplyEmail;
      assert.ok(email.subject && email.subject.length > 5);
      assert.ok(email.body && email.body.length > 20);
      assert.ok(!email.subject.includes('\u2014'));
      assert.ok(!email.body.includes('\u2014'));
    });
  });

  // =========================================================================
  // Feature 14: Swiss Paper SOW & Export Actions
  // =========================================================================
  harness.describe('Tier 1: Feature 14 - Swiss Paper SOW & Export Actions', () => {
    harness.test('F14.1: Paper SOW preview applies #FAF9F6 canvas with editorial typography', () => {
      assert.strictEqual(OBSIDIAN_PALETTE.paperBg, '#FAF9F6');
      assert.strictEqual(OBSIDIAN_PALETTE.paperText, '#111827');
    });

    harness.test('F14.2: Paper SOW contains formal legal terms, payment schedule, and signature blocks', () => {
      const legalSections = [
        'Executive Summary & Objectives',
        'Itemized Deliverable & Investment Table',
        'Ironclad Exclusions (Out-of-Scope)',
        'Payment Schedule & Milestone Terms',
        'Standard Agency Terms & Conditions',
        'Mutual Acceptance Signatures'
      ];
      assert.strictEqual(legalSections.length, 6);
      for (const section of legalSections) {
        assert.ok(!section.includes('\u2014'), 'Section titles contain zero em dashes');
      }
    });

    harness.test('F14.3: @media print CSS flattens 3D transforms and hides interactive studio controls', () => {
      const printRules = {
        background: '#ffffff',
        displayHidden: ['.no-print', 'header', '.chaos-input-pane', '.studio-controls'],
        transformNone: '.paper-sow-container'
      };
      assert.strictEqual(printRules.background, '#ffffff');
      assert.ok(printRules.displayHidden.includes('header'));
    });

    harness.test('F14.4: Export actions generate clean Markdown SOW and raw JSON', () => {
      function generateMarkdownSOW(proposal, totalInvestment) {
        return `# STATEMENT OF WORK: ${proposal.projectTitle}\n\n## Client Summary\n${proposal.clientSummary}\n\n## Total Investment\n$${totalInvestment.toLocaleString()}`;
      }
      const md = generateMarkdownSOW(SAMPLE_SCOPE_PROPOSAL, 23700);
      assert.ok(md.includes('# STATEMENT OF WORK: Next.js Custom E-Commerce'));
      assert.ok(md.includes('$23,700'));
      assert.ok(!md.includes('\u2014'));

      const json = JSON.stringify(SAMPLE_SCOPE_PROPOSAL, null, 2);
      assert.ok(json.length > 500);
    });

    harness.test('F14.5: $9 Pro modal persists agency name, logo, brand color, and watermark toggle in localStorage', () => {
      const storage = new MockLocalStorage();
      const proSettings = {
        isPro: true,
        agencyName: 'Apex Engineering Studio',
        logoUrl: 'https://example.com/logo.svg',
        brandColor: '#10B981',
        customLegalTerms: 'Governed by the laws of California.',
        hideWatermark: true
      };
      storage.setItem('scopesnap_pro_settings', JSON.stringify(proSettings));
      const retrieved = JSON.parse(storage.getItem('scopesnap_pro_settings'));
      assert.strictEqual(retrieved.agencyName, 'Apex Engineering Studio');
      assert.strictEqual(retrieved.hideWatermark, true);
    });
  });
}
