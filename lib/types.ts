import { z } from "zod";

/**
 * lib/types.ts
 * TypeScript interfaces and Zod validation schemas for ScopeSnap.
 * Strict constraint: Zero em dashes (U+2014) anywhere in code or comments.
 */

// =============================================================================
// Supported Currency and Buffer Types
// =============================================================================

export type Currency = "USD" | "INR" | "EUR" | "GBP";

export type RiskBufferMultiplier = 1.0 | 1.15 | 1.35;

export type PaymentSchedule = "50/50" | "40/30/30" | "retainer";

export type DeliverableComplexity = "Low" | "Med" | "High";

// =============================================================================
// Zod Schemas
// =============================================================================

// --- Request Validation Schema ---
export const GenerateScopeRequestSchema = z.object({
  rawNotes: z
    .string()
    .min(10, "Client notes must contain at least 10 characters")
    .max(20000, "Client notes cannot exceed 20,000 characters"),
  projectType: z.string().optional().default("Web Application"),
  currency: z.enum(["USD", "INR", "EUR", "GBP"]).default("USD"),
  hourlyRate: z.number().positive("Hourly rate must be a positive number").default(100),
  customApiKey: z.string().optional(),
});

export type GenerateScopeRequest = z.infer<typeof GenerateScopeRequestSchema>;

// --- Deliverable Validation Schema ---
export const DeliverableSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Deliverable name cannot be empty"),
  hours: z.number().int().positive("Hours must be a positive integer"),
  complexity: z.enum(["Low", "Med", "High"]),
  included: z.boolean().default(true),
});

export type Deliverable = z.infer<typeof DeliverableSchema>;

// --- Milestone Phase Validation Schema ---
export const MilestonePhaseSchema = z.object({
  id: z.string(),
  phase: z.string(), // e.g. "Phase 01"
  title: z.string(), // e.g. "Architecture & Discovery"
  deliverables: z.array(DeliverableSchema).min(1, "Phase must contain at least 1 deliverable"),
  phaseTotalHours: z.number().int().nonnegative(),
});

export type MilestonePhase = z.infer<typeof MilestonePhaseSchema>;

// --- Reply Email Validation Schema ---
export const ReplyEmailSchema = z.object({
  subject: z.string().min(1, "Email subject cannot be empty"),
  body: z.string().min(1, "Email body cannot be empty"),
});

export type ReplyEmail = z.infer<typeof ReplyEmailSchema>;

// --- Scope Proposal Validation Schema ---
export const ScopeProposalSchema = z.object({
  projectTitle: z.string().min(1, "Project title cannot be empty"),
  clientSummary: z.string().min(1, "Client summary cannot be empty"),
  detectedTraps: z.array(z.string()).min(1, "At least 1 detected trap is required"),
  milestones: z.array(MilestonePhaseSchema).length(3, "Milestones must contain exactly 3 phases"),
  outOfScope: z.array(z.string()).min(1, "At least 1 out-of-scope guardrail is required"),
  assumptions: z.array(z.string()).min(1, "At least 1 assumption is required"),
  discoveryQuestions: z.array(z.string()).min(1, "At least 1 discovery question is required"),
  recommendedReplyEmail: ReplyEmailSchema,
  demoMode: z.boolean().optional().default(false),
});

export type ScopeProposal = z.infer<typeof ScopeProposalSchema>;

// =============================================================================
// Calibration & Configuration Interfaces
// =============================================================================

export interface CurrencyConfig {
  symbol: string;
  code: Currency;
  minRate: number;
  maxRate: number;
  defaultRate: number;
  step: number;
}

export interface RiskBufferOption {
  key: string;
  multiplier: number;
  label: string;
}

export interface CalibrationSettings {
  currency: Currency;
  hourlyRate: number;
  riskBuffer: number;
  paymentSchedule: PaymentSchedule;
}

// =============================================================================
// Scanner & Presets Interfaces
// =============================================================================

export interface VaguePhrasePattern {
  id: string;
  phrase: string;
  regex: RegExp;
  category: string;
  riskExplanation: string;
}

export interface VagueMatchOccurrence {
  matchedText: string;
  index: number;
}

export interface VagueMatch {
  id: string;
  phrase: string;
  category: string;
  count: number;
  riskExplanation: string;
  occurrences?: VagueMatchOccurrence[];
}

export interface VagueScanResult {
  matches: VagueMatch[];
  totalTrapCount: number;
}

export interface ClientChaosPreset {
  id: string;
  category: string;
  label: string;
  subtitle: string;
  badge: string;
  rawText: string;
}

// =============================================================================
// Pro Settings & Calculations
// =============================================================================

export interface ProSettings {
  isPro: boolean;
  agencyName: string;
  logoUrl: string;
  brandColor: string;
  customLegalTerms: string;
  hideWatermark: boolean;
}

export interface PaymentSplitItem {
  phase: string;
  amount: number;
}

export interface PaymentSplitResult {
  schedule: PaymentSchedule;
  items: PaymentSplitItem[];
  total: number;
  months?: number;
}

export interface CalculationResult {
  baseHours: number;
  billableHours: number;
  totalInvestment: number;
  timelineWeeks: number;
  timelineDays: number;
  formattedTimeline: string;
  confidenceScore: number;
  paymentSplit: PaymentSplitResult;
}
