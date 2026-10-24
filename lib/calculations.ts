import {
  MilestonePhase,
  PaymentSchedule,
  CalibrationSettings,
  CalculationResult,
  PaymentSplitResult,
  VaguePhrasePattern,
  VagueScanResult,
  VagueMatch,
} from "./types";
import { VAGUE_PHRASE_PATTERNS } from "./constants";

/**
 * lib/calculations.ts
 * Exact real-time math engine for ScopeSnap proposal recalculation.
 * Pure TypeScript functions with zero network latency.
 * Strict constraint: Zero em dashes (U+2014) anywhere in code or comments.
 */

// =============================================================================
// 1. Base Deliverable Hours Sum
// =============================================================================

/**
 * Sums hours for all active, included deliverables across all milestones.
 */
export function calculateBaseHours(milestones: MilestonePhase[]): number {
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
}

// =============================================================================
// 2. Billable Hours with Risk Buffer
// =============================================================================

/**
 * Applies risk buffer multiplier (1.0x, 1.15x, 1.35x) to base hours with integer rounding.
 * Negative or sub-1.0 multipliers are clamped safely to 1.0 minimum.
 */
export function calculateBillableHours(baseHours: number, riskBuffer: number = 1.0): number {
  if (baseHours <= 0) return 0;
  const numBuffer = Number(riskBuffer);
  const buffer = Number.isNaN(numBuffer) || numBuffer < 1.0 ? 1.0 : numBuffer;
  return Math.round(baseHours * buffer);
}

// =============================================================================
// 3. Total Project Investment
// =============================================================================

/**
 * Computes total project investment given billable hours and hourly rate.
 */
export function calculateTotalInvestment(billableHours: number, hourlyRate: number = 100): number {
  if (billableHours <= 0) return 0;
  const rate = Number(hourlyRate) || 0;
  return billableHours * rate;
}

// =============================================================================
// 4. Timeline Estimation (Weeks & Business Days)
// =============================================================================

/**
 * Estimates timeline duration assuming 25 billable engineering hours per week (5 hours per working day).
 */
export function calculateTimeline(billableHours: number): {
  totalWeeks: number;
  totalDays: number;
  formatted: string;
} {
  if (billableHours <= 0) {
    return {
      totalWeeks: 0,
      totalDays: 0,
      formatted: "0 Weeks (0 Days)",
    };
  }

  const totalWeeks = Math.max(1, Math.ceil(billableHours / 25));
  const totalDays = Math.max(5, Math.ceil(billableHours / 5));

  return {
    totalWeeks,
    totalDays,
    formatted: `${totalWeeks} ${totalWeeks === 1 ? "Week" : "Weeks"} (${totalDays} Days)`,
  };
}

// =============================================================================
// 5. Scope Confidence Score
// =============================================================================

/**
 * Computes scope confidence score clamped within [45, 98] based on detected traps,
 * high-complexity tasks, active hours, and defensive risk buffer.
 */
export function calculateConfidenceScore({
  trapCount = 0,
  riskBuffer = 1.0,
  highComplexityCount = 0,
  activeHours = 0,
}: {
  trapCount?: number;
  riskBuffer?: number;
  highComplexityCount?: number;
  activeHours?: number;
}): number {
  const trapPenalty = trapCount * 8;
  const hoursPenalty = activeHours > 120 ? 10 : 0;
  const complexityPenalty = highComplexityCount * 3;

  let riskBonus = 0;
  if (riskBuffer >= 1.35) {
    riskBonus = 12;
  } else if (riskBuffer >= 1.15) {
    riskBonus = 5;
  }

  const rawScore = 100 - trapPenalty - hoursPenalty - complexityPenalty + riskBonus;
  return Math.max(45, Math.min(98, rawScore));
}

// =============================================================================
// 6. Payment Schedule Split Breakdown
// =============================================================================

/**
 * Calculates milestone payment splits with integer rounding and exact conservation
 * of total investment (zero penny drift).
 */
export function calculatePaymentSplit(
  totalInvestment: number,
  schedule: PaymentSchedule = "50/50",
  totalWeeks: number = 4
): PaymentSplitResult {
  if (totalInvestment <= 0) {
    return {
      schedule,
      items: [],
      total: 0,
    };
  }

  if (schedule === "50/50") {
    const deposit = Math.round(totalInvestment * 0.5);
    const finalPayment = totalInvestment - deposit;
    return {
      schedule,
      items: [
        { phase: "Kickoff Deposit (50%)", amount: deposit },
        { phase: "Final Acceptance (50%)", amount: finalPayment },
      ],
      total: deposit + finalPayment,
    };
  }

  if (schedule === "40/30/30") {
    const m1 = Math.round(totalInvestment * 0.4);
    const m2 = Math.round(totalInvestment * 0.3);
    const m3 = totalInvestment - m1 - m2;
    return {
      schedule,
      items: [
        { phase: "Phase 01 Deposit (40%)", amount: m1 },
        { phase: "Phase 02 Beta (30%)", amount: m2 },
        { phase: "Phase 03 Final (30%)", amount: m3 },
      ],
      total: m1 + m2 + m3,
    };
  }

  if (schedule === "retainer") {
    const months = Math.max(1, Math.round(totalWeeks / 4));
    const monthlyAmount = Math.round(totalInvestment / months);
    const items = [];
    let accumulated = 0;

    for (let i = 1; i <= months; i++) {
      const isLast = i === months;
      const amt = isLast ? totalInvestment - accumulated : monthlyAmount;
      accumulated += amt;
      items.push({ phase: `Month ${i} Installment`, amount: amt });
    }

    return {
      schedule,
      months,
      items,
      total: accumulated,
    };
  }

  throw new Error(`Unsupported payment schedule: ${schedule}`);
}

// =============================================================================
// 7. Client-Side Vague Phrase Scanner
// =============================================================================

/**
 * Scans an unstructured client notes string against the regex pattern catalog.
 */
export function scanVaguePhrases(
  text: string,
  patterns: VaguePhrasePattern[] = VAGUE_PHRASE_PATTERNS
): VagueScanResult {
  if (!text || typeof text !== "string") {
    return { matches: [], totalTrapCount: 0 };
  }

  const results: VagueMatch[] = [];
  let totalTrapCount = 0;

  for (const p of patterns) {
    // Re-create RegExp instance to reset lastIndex cleanly
    const regex = new RegExp(p.regex.source, p.regex.flags);
    const occurrences = [];
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      occurrences.push({
        matchedText: match[0],
        index: match.index,
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
        occurrences,
      });
    }
  }

  return {
    matches: results,
    totalTrapCount,
  };
}

// =============================================================================
// 8. High Complexity Deliverables Counter
// =============================================================================

/**
 * Counts included deliverables marked with High complexity.
 */
export function countHighComplexityDeliverables(milestones: MilestonePhase[]): number {
  if (!Array.isArray(milestones)) return 0;
  let count = 0;
  for (const phase of milestones) {
    if (Array.isArray(phase.deliverables)) {
      for (const item of phase.deliverables) {
        if (item.included !== false && item.complexity === "High") {
          count++;
        }
      }
    }
  }
  return count;
}

// =============================================================================
// 9. Full Proposal Recalculation Aggregate
// =============================================================================

/**
 * Aggregates all proposal mathematical recalculations based on calibration settings.
 */
export function recalculateProposal(
  milestones: MilestonePhase[],
  settings: CalibrationSettings,
  detectedTrapsCount: number = 0
): CalculationResult {
  const baseHours = calculateBaseHours(milestones);
  const billableHours = calculateBillableHours(baseHours, settings.riskBuffer);
  const totalInvestment = calculateTotalInvestment(billableHours, settings.hourlyRate);
  const timeline = calculateTimeline(billableHours);
  const highComplexityCount = countHighComplexityDeliverables(milestones);

  const confidenceScore = calculateConfidenceScore({
    trapCount: detectedTrapsCount,
    riskBuffer: settings.riskBuffer,
    highComplexityCount,
    activeHours: baseHours,
  });

  const paymentSplit = calculatePaymentSplit(
    totalInvestment,
    settings.paymentSchedule,
    timeline.totalWeeks
  );

  return {
    baseHours,
    billableHours,
    totalInvestment,
    timelineWeeks: timeline.totalWeeks,
    timelineDays: timeline.totalDays,
    formattedTimeline: timeline.formatted,
    confidenceScore,
    paymentSplit,
  };
}
