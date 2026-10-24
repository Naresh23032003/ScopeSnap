/**
 * tests/e2e/harness.js
 * Lightweight, zero-dependency test harness and assertion library for ScopeSnap.
 * Strict constraint: Zero em dashes (U+2014) anywhere in code or console outputs.
 */

class TestHarness {
  constructor() {
    this.suites = [];
    this.currentSuite = null;
    this.totalTests = 0;
    this.passedTests = 0;
    this.failedTests = 0;
    this.skippedTests = 0;
    this.startTime = 0;
    this.endTime = 0;
  }

  describe(name, fn) {
    const suite = {
      name,
      tests: [],
      beforeAllFns: [],
      afterAllFns: [],
      beforeEachFns: [],
      afterEachFns: []
    };
    this.suites.push(suite);
    const prevSuite = this.currentSuite;
    this.currentSuite = suite;
    try {
      fn();
    } finally {
      this.currentSuite = prevSuite;
    }
  }

  it(name, fn) {
    this.test(name, fn);
  }

  test(name, fn) {
    if (!this.currentSuite) {
      this.describe('Default Suite', () => {
        this.currentSuite.tests.push({ name, fn, status: 'pending' });
      });
      return;
    }
    this.currentSuite.tests.push({ name, fn, status: 'pending' });
  }

  beforeAll(fn) {
    if (this.currentSuite) this.currentSuite.beforeAllFns.push(fn);
  }

  afterAll(fn) {
    if (this.currentSuite) this.currentSuite.afterAllFns.push(fn);
  }

  beforeEach(fn) {
    if (this.currentSuite) this.currentSuite.beforeEachFns.push(fn);
  }

  afterEach(fn) {
    if (this.currentSuite) this.currentSuite.afterEachFns.push(fn);
  }

  async run() {
    this.startTime = Date.now();
    this.totalTests = 0;
    this.passedTests = 0;
    this.failedTests = 0;

    for (const suite of this.suites) {
      for (const fn of suite.beforeAllFns) {
        await fn();
      }

      for (const t of suite.tests) {
        this.totalTests++;
        for (const fn of suite.beforeEachFns) {
          await fn();
        }

        const tStart = Date.now();
        try {
          await t.fn();
          t.status = 'pass';
          t.duration = Date.now() - tStart;
          this.passedTests++;
        } catch (err) {
          t.status = 'fail';
          t.duration = Date.now() - tStart;
          t.error = err;
          this.failedTests++;
        }

        for (const fn of suite.afterEachFns) {
          await fn();
        }
      }

      for (const fn of suite.afterAllFns) {
        await fn();
      }
    }

    this.endTime = Date.now();
    return {
      total: this.totalTests,
      passed: this.passedTests,
      failed: this.failedTests,
      skipped: this.skippedTests,
      durationMs: this.endTime - this.startTime,
      suites: this.suites
    };
  }
}

// Micro Assertion Utilities
export const assert = {
  ok(val, message) {
    if (!val) {
      throw new Error(message || `Assertion failed: expected truthy, received ${JSON.stringify(val)}`);
    }
  },

  strictEqual(actual, expected, message) {
    if (actual !== expected) {
      throw new Error(message || `Assertion failed: expected ${JSON.stringify(expected)}, received ${JSON.stringify(actual)}`);
    }
  },

  notStrictEqual(actual, expected, message) {
    if (actual === expected) {
      throw new Error(message || `Assertion failed: expected values to differ, both are ${JSON.stringify(actual)}`);
    }
  },

  deepStrictEqual(actual, expected, message) {
    const aStr = JSON.stringify(actual);
    const eStr = JSON.stringify(expected);
    if (aStr !== eStr) {
      throw new Error(message || `Assertion failed:\nExpected: ${eStr}\nReceived: ${aStr}`);
    }
  },

  match(val, regex, message) {
    if (typeof val !== 'string' || !regex.test(val)) {
      throw new Error(message || `Assertion failed: string does not match regex ${regex}`);
    }
  },

  doesNotMatch(val, regex, message) {
    if (typeof val === 'string' && regex.test(val)) {
      throw new Error(message || `Assertion failed: string unexpectedly matches regex ${regex}`);
    }
  },

  closeTo(actual, expected, delta = 0.001, message) {
    if (Math.abs(actual - expected) > delta) {
      throw new Error(message || `Assertion failed: expected ${actual} to be within ${delta} of ${expected}`);
    }
  },

  inRange(val, min, max, message) {
    if (val < min || val > max) {
      throw new Error(message || `Assertion failed: value ${val} out of range [${min}, ${max}]`);
    }
  },

  throws(fn, expectedError, message) {
    let threw = false;
    try {
      fn();
    } catch (err) {
      threw = true;
      if (expectedError) {
        if (typeof expectedError === 'string' && !err.message.includes(expectedError)) {
          throw new Error(`Expected error message to contain "${expectedError}", received "${err.message}"`);
        }
        if (expectedError instanceof RegExp && !expectedError.test(err.message)) {
          throw new Error(`Expected error message to match ${expectedError}, received "${err.message}"`);
        }
      }
    }
    if (!threw) {
      throw new Error(message || 'Expected function to throw an error, but it returned normally');
    }
  },

  rejects: async (asyncFn, expectedError, message) => {
    let threw = false;
    try {
      await asyncFn();
    } catch (err) {
      threw = true;
      if (expectedError) {
        if (typeof expectedError === 'string' && !err.message.includes(expectedError)) {
          throw new Error(`Expected error message to contain "${expectedError}", received "${err.message}"`);
        }
        if (expectedError instanceof RegExp && !expectedError.test(err.message)) {
          throw new Error(`Expected error message to match ${expectedError}, received "${err.message}"`);
        }
      }
    }
    if (!threw) {
      throw new Error(message || 'Expected async function to reject, but it resolved');
    }
  }
};

// Calculation Oracle Engine (implements R3.B specification formulas)
export const CalculationOracle = {
  // Sum active included deliverable hours
  calculateBaseHours(milestones) {
    if (!Array.isArray(milestones)) return 0;
    let sum = 0;
    for (const phase of milestones) {
      if (Array.isArray(phase.deliverables)) {
        for (const item of phase.deliverables) {
          if (item.included !== false) {
            sum += Number(item.hours) || 0;
          }
        }
      }
    }
    return sum;
  },

  // Calculate billable hours with risk buffer
  calculateBillableHours(baseHours, riskBuffer = 1.0) {
    if (baseHours <= 0) return 0;
    const buffer = Number(riskBuffer) || 1.0;
    return Math.round(baseHours * buffer);
  },

  // Calculate total investment
  calculateTotalInvestment(billableHours, hourlyRate = 100) {
    if (billableHours <= 0) return 0;
    const rate = Number(hourlyRate) || 0;
    return billableHours * rate;
  },

  // Calculate timeline in weeks and business days
  calculateTimeline(billableHours) {
    if (billableHours <= 0) {
      return { totalWeeks: 0, totalDays: 0, formatted: '0 Weeks (0 Days)' };
    }
    const totalWeeks = Math.max(1, Math.ceil(billableHours / 25));
    const totalDays = Math.max(5, Math.ceil(billableHours / 5));
    return {
      totalWeeks,
      totalDays,
      formatted: `${totalWeeks} ${totalWeeks === 1 ? 'Week' : 'Weeks'} (${totalDays} Days)`
    };
  },

  // Calculate scope confidence score
  calculateConfidenceScore({ trapCount = 0, riskBuffer = 1.0, highComplexityCount = 0, activeHours = 0 }) {
    const trapPenalty = trapCount * 8;
    const hoursPenalty = activeHours > 120 ? 10 : 0;
    const complexityPenalty = highComplexityCount * 3;
    let riskBonus = 0;
    if (riskBuffer >= 1.35) riskBonus = 12;
    else if (riskBuffer >= 1.15) riskBonus = 5;

    const rawScore = 100 - trapPenalty - hoursPenalty - complexityPenalty + riskBonus;
    return Math.max(45, Math.min(98, rawScore));
  },

  // Calculate payment split breakdown
  calculatePaymentSplit(totalInvestment, schedule = '50/50', totalWeeks = 4) {
    if (totalInvestment <= 0) {
      return { schedule, items: [] };
    }

    if (schedule === '50/50') {
      const deposit = Math.round(totalInvestment * 0.50);
      const finalPayment = totalInvestment - deposit;
      return {
        schedule,
        items: [
          { phase: 'Kickoff Deposit (50%)', amount: deposit },
          { phase: 'Final Acceptance (50%)', amount: finalPayment }
        ],
        total: deposit + finalPayment
      };
    }

    if (schedule === '40/30/30') {
      const m1 = Math.round(totalInvestment * 0.40);
      const m2 = Math.round(totalInvestment * 0.30);
      const m3 = totalInvestment - m1 - m2;
      return {
        schedule,
        items: [
          { phase: 'Phase 01 Deposit (40%)', amount: m1 },
          { phase: 'Phase 02 Beta (30%)', amount: m2 },
          { phase: 'Phase 03 Final (30%)', amount: m3 }
        ],
        total: m1 + m2 + m3
      };
    }

    if (schedule === 'retainer') {
      const months = Math.max(1, Math.round(totalWeeks / 4));
      const monthlyAmount = Math.round(totalInvestment / months);
      const items = [];
      let accumulated = 0;
      for (let i = 1; i <= months; i++) {
        const isLast = i === months;
        const amt = isLast ? (totalInvestment - accumulated) : monthlyAmount;
        accumulated += amt;
        items.push({ phase: `Month ${i} Installment`, amount: amt });
      }
      return {
        schedule,
        months,
        items,
        total: accumulated
      };
    }

    throw new Error(`Unsupported payment schedule: ${schedule}`);
  }
};

// Vague Scanner Oracle Engine (implements R3.B client-side regex matching)
export const VagueScannerOracle = {
  scan(text, patterns) {
    if (!text || typeof text !== 'string') {
      return { matches: [], totalTrapCount: 0 };
    }
    const results = [];
    let totalTrapCount = 0;

    for (const p of patterns) {
      // Create fresh RegExp to reset lastIndex
      const regex = new RegExp(p.regex.source, p.regex.flags);
      const occurrences = [];
      let match;
      while ((match = regex.exec(text)) !== null) {
        occurrences.push({
          matchedText: match[0],
          index: match.index
        });
      }

      if (occurrences.length > 0) {
        totalTrapCount += occurrences.length;
        results.push({
          id: p.id,
          phrase: p.phrase,
          category: p.category,
          count: occurrences.length,
          riskExplanation: p.riskExplanation,
          occurrences
        });
      }
    }

    return {
      matches: results,
      totalTrapCount
    };
  }
};

// Mock LocalStorage for BYOK & Pro Persistence Testing
export class MockLocalStorage {
  constructor() {
    this.store = new Map();
  }

  getItem(key) {
    return this.store.has(key) ? this.store.get(key) : null;
  }

  setItem(key, value) {
    this.store.set(key, String(value));
  }

  removeItem(key) {
    this.store.delete(key);
  }

  clear() {
    this.store.clear();
  }

  get length() {
    return this.store.size;
  }
}

// 3D Spatial Math Oracle
export const SpatialMathOracle = {
  // Rotate a 3D point [x, y, z] by Euler angles (in radians) around X, Y, Z
  rotatePoint(p, rotX, rotY, rotZ) {
    let [x, y, z] = p;

    // Rotate around X
    const cosX = Math.cos(rotX);
    const sinX = Math.sin(rotX);
    const y1 = y * cosX - z * sinX;
    const z1 = y * sinX + z * cosX;

    // Rotate around Y
    const cosY = Math.cos(rotY);
    const sinY = Math.sin(rotY);
    const x2 = x * cosY + z1 * sinY;
    const z2 = -x * sinY + z1 * cosY;

    // Rotate around Z
    const cosZ = Math.cos(rotZ);
    const sinZ = Math.sin(rotZ);
    const x3 = x2 * cosZ - y1 * sinZ;
    const y3 = x2 * sinZ + y1 * cosZ;

    return [x3, y3, z2];
  },

  // Project 3D coordinate to 2D canvas with perspective distance d
  projectPerspective(p, distance = 400, canvasWidth = 100, canvasHeight = 100) {
    const [x, y, z] = p;
    const factor = distance / (distance + z);
    const projX = canvasWidth / 2 + x * factor;
    const projY = canvasHeight / 2 - y * factor;
    return { x: projX, y: projY, scale: factor, z };
  },

  // Calculate dynamic specular glare gradient position
  calculateSpecularGlare(mouseX, mouseY, cardRect) {
    const relX = mouseX - cardRect.left;
    const relY = mouseY - cardRect.top;
    return `radial-gradient(400px circle at ${relX}px ${relY}px, rgba(16, 185, 129, 0.12), transparent 70%)`;
  }
};

// Schema Validation Oracle
export const SchemaValidator = {
  validateScopeProposal(obj) {
    const errors = [];
    if (!obj || typeof obj !== 'object') {
      return { valid: false, errors: ['Object must be non-null object'] };
    }

    if (typeof obj.projectTitle !== 'string' || obj.projectTitle.trim().length === 0) {
      errors.push('projectTitle must be non-empty string');
    }
    if (typeof obj.clientSummary !== 'string' || obj.clientSummary.trim().length === 0) {
      errors.push('clientSummary must be non-empty string');
    }
    if (!Array.isArray(obj.detectedTraps) || obj.detectedTraps.length === 0) {
      errors.push('detectedTraps must be non-empty array of strings');
    }
    if (!Array.isArray(obj.milestones) || obj.milestones.length !== 3) {
      errors.push('milestones must contain exactly 3 phases');
    } else {
      obj.milestones.forEach((m, idx) => {
        if (!m.id || !m.phase || !m.title) {
          errors.push(`milestone[${idx}] missing id, phase, or title`);
        }
        if (!Array.isArray(m.deliverables) || m.deliverables.length === 0) {
          errors.push(`milestone[${idx}].deliverables must be non-empty array`);
        } else {
          m.deliverables.forEach((d, dIdx) => {
            if (!d.id || !d.name) {
              errors.push(`milestone[${idx}].deliverable[${dIdx}] missing id or name`);
            }
            if (typeof d.hours !== 'number' || d.hours <= 0) {
              errors.push(`milestone[${idx}].deliverable[${dIdx}].hours must be positive number`);
            }
            if (!['Low', 'Med', 'High'].includes(d.complexity)) {
              errors.push(`milestone[${idx}].deliverable[${dIdx}].complexity must be Low, Med, or High`);
            }
          });
        }
      });
    }

    if (!Array.isArray(obj.outOfScope) || obj.outOfScope.length === 0) {
      errors.push('outOfScope must be non-empty array');
    }
    if (!Array.isArray(obj.assumptions) || obj.assumptions.length === 0) {
      errors.push('assumptions must be non-empty array');
    }
    if (!Array.isArray(obj.discoveryQuestions) || obj.discoveryQuestions.length === 0) {
      errors.push('discoveryQuestions must be non-empty array');
    }
    if (!obj.recommendedReplyEmail || typeof obj.recommendedReplyEmail !== 'object') {
      errors.push('recommendedReplyEmail must be object with subject and body');
    } else {
      if (typeof obj.recommendedReplyEmail.subject !== 'string') {
        errors.push('recommendedReplyEmail.subject must be string');
      }
      if (typeof obj.recommendedReplyEmail.body !== 'string') {
        errors.push('recommendedReplyEmail.body must be string');
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
};

export const harness = new TestHarness();
