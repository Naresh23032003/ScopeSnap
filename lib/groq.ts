import { ScopeProposal, ScopeProposalSchema } from "./types";
import {
  PROPOSAL_PRESET_1,
  PROPOSAL_PRESET_2,
  PROPOSAL_PRESET_3,
  PROPOSAL_PRESET_4,
} from "./constants";

/**
 * lib/groq.ts
 * Groq LPU API client integration and resilient offline demo fallback engine.
 * Model: llama-3.3-70b-versatile with temperature 0.2 and json_object response format.
 * Strict constraint: Zero em dashes (U+2014) anywhere in code or comments.
 */

// =============================================================================
// 1. Authoritative System Prompt
// =============================================================================

export const GROQ_SYSTEM_PROMPT = `You are an elite B2B software engineering director and agency scoping expert. Your job is to transform unstructured, ambiguous client communications (call notes, Slack dumps, transcripts) into a watertight Statement of Work (SOW) and milestone pricing matrix.

CRITICAL INSTRUCTIONS:
1. You must respond with valid JSON matching the exact schema specified below.
2. Group all deliverables into exactly 3 phases:
   - Phase 01: Architecture, Discovery & Data Schema
   - Phase 02: Core Build, Engine & Integration
   - Phase 03: Hardening, QA, Documentation & Launch
3. Provide realistic, senior-level engineering hour estimates for each deliverable (e.g. 6 to 32 hours per deliverable).
4. Identify every hidden scope trap, vague expectation, and infinite liability phrase in detectedTraps.
5. Create an aggressive, protective list of outOfScope guardrails explicitly excluding unbilled features.
6. Formulate 3 to 5 high-leverage discoveryQuestions to clarify critical unknowns before signing.
7. Compose a polite, assertive, highly professional recommendedReplyEmail that establishes boundaries while exciting the client.
8. STRICT TEXT CONSTRAINT: Do NOT use the em dash character (U+2014) anywhere in your output. Use hyphens (-), colons (:), or bullets instead.

SCHEMA REQUIRED:
{
  "projectTitle": "string",
  "clientSummary": "string",
  "detectedTraps": ["string"],
  "milestones": [
    {
      "id": "phase-01",
      "phase": "Phase 01",
      "title": "Architecture, Discovery & Data Schema",
      "deliverables": [
        { "id": "d-101", "name": "string", "hours": 16, "complexity": "Low" | "Med" | "High", "included": true }
      ],
      "phaseTotalHours": 16
    },
    {
      "id": "phase-02",
      "phase": "Phase 02",
      "title": "Core Build, Engine & Integration",
      "deliverables": [
        { "id": "d-201", "name": "string", "hours": 24, "complexity": "Low" | "Med" | "High", "included": true }
      ],
      "phaseTotalHours": 24
    },
    {
      "id": "phase-03",
      "phase": "Phase 03",
      "title": "Hardening, QA, Documentation & Launch",
      "deliverables": [
        { "id": "d-301", "name": "string", "hours": 12, "complexity": "Low" | "Med" | "High", "included": true }
      ],
      "phaseTotalHours": 12
    }
  ],
  "outOfScope": ["string"],
  "assumptions": ["string"],
  "discoveryQuestions": ["string"],
  "recommendedReplyEmail": {
    "subject": "string",
    "body": "string"
  }
}`;

// =============================================================================
// 2. User Prompt Builder
// =============================================================================

export function buildUserPrompt(params: {
  rawNotes: string;
  projectType?: string;
  currency?: string;
  hourlyRate?: number;
}): string {
  const { rawNotes, projectType = "Web Application", currency = "USD", hourlyRate = 100 } = params;

  return `PROJECT TYPE: ${projectType}
TARGET CURRENCY: ${currency}
TARGET BASE HOURLY RATE: ${hourlyRate}

CLIENT NOTES DUMP:
"""
${rawNotes}
"""

Generate the comprehensive, ironclad scope proposal JSON following the exact schema and instructions. Ensure exactly 3 milestone phases and zero em dashes (U+2014).`;
}

// =============================================================================
// 3. Resilient Context-Aware Demo Fallback Generator
// =============================================================================

/**
 * Generates a realistic, structured scope proposal when offline or when no Groq key is configured.
 * Simulates ~320ms LPU latency and selects the closest realistic preset dataset based on keywords.
 */
export async function generateDemoScope(
  rawNotes: string = "",
  currency: string = "USD",
  hourlyRate: number = 100
): Promise<ScopeProposal> {
  // Simulate realistic ~320ms Groq LPU inference latency
  await new Promise((resolve) => setTimeout(resolve, 320));

  const lowerNotes = rawNotes.toLowerCase();
  let baseProposal: ScopeProposal;

  if (
    lowerNotes.includes("document") ||
    lowerNotes.includes("pinecone") ||
    lowerNotes.includes("vector") ||
    lowerNotes.includes("pdf") ||
    lowerNotes.includes("notion ai") ||
    lowerNotes.includes("ai saas") ||
    lowerNotes.includes("dave")
  ) {
    baseProposal = PROPOSAL_PRESET_2;
  } else if (
    lowerNotes.includes("landing page") ||
    lowerNotes.includes("brand refresh") ||
    lowerNotes.includes("friday asap") ||
    lowerNotes.includes("spline") ||
    lowerNotes.includes("pitch deck") ||
    lowerNotes.includes("lorem ipsum")
  ) {
    baseProposal = PROPOSAL_PRESET_3;
  } else if (
    lowerNotes.includes("social login") ||
    lowerNotes.includes("rbac") ||
    lowerNotes.includes("two-factor") ||
    lowerNotes.includes("2fa") ||
    lowerNotes.includes("audit log") ||
    lowerNotes.includes("kickoff") ||
    lowerNotes.includes("squeeze in")
  ) {
    baseProposal = PROPOSAL_PRESET_4;
  } else {
    // Default to Preset 1 (E-Commerce Rebuild)
    baseProposal = PROPOSAL_PRESET_1;
  }

  // Clone to avoid mutating static constants
  const proposal: ScopeProposal = JSON.parse(JSON.stringify(baseProposal));

  // Ensure demoMode flag is explicitly set
  proposal.demoMode = true;

  // Guarantee phaseTotalHours matches sum of deliverables
  for (const phase of proposal.milestones) {
    phase.phaseTotalHours = phase.deliverables.reduce(
      (sum, d) => sum + (d.included !== false ? Number(d.hours) || 0 : 0),
      0
    );
  }

  // Validate output against Zod schema
  return ScopeProposalSchema.parse(proposal);
}

// =============================================================================
// 4. Live Groq Cloud LPU API Client
// =============================================================================

export interface CallGroqApiParams {
  rawNotes: string;
  projectType?: string;
  currency?: string;
  hourlyRate?: number;
  apiKey: string;
}

/**
 * Calls the Groq Chat Completions API with llama-3.3-70b-versatile in json_object mode.
 * Enforces strict 15-second timeout and validates the response with ScopeProposalSchema.
 */
export async function callGroqApi(params: CallGroqApiParams): Promise<ScopeProposal> {
  const { rawNotes, projectType, currency, hourlyRate, apiKey } = params;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const userPrompt = buildUserPrompt({ rawNotes, projectType, currency, hourlyRate });

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: GROQ_SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw new Error(
        `Groq API request failed with status ${response.status}: ${errorText.slice(0, 300)}`
      );
    }

    const json = await response.json();
    const content = json?.choices?.[0]?.message?.content;

    if (!content || typeof content !== "string") {
      throw new Error("Empty or malformed completion content returned from Groq API");
    }

    // Sanitize any accidental em dash (U+2014) in the model's text response
    const sanitizedContent = content.replace(/\u2014/g, " - ");
    const parsedData = JSON.parse(sanitizedContent);

    // Ensure phaseTotalHours is populated for each milestone phase
    if (Array.isArray(parsedData.milestones)) {
      for (const m of parsedData.milestones) {
        if (Array.isArray(m.deliverables)) {
          m.phaseTotalHours = m.deliverables.reduce(
            (acc: number, d: { hours?: number }) => acc + (Number(d?.hours) || 0),
            0
          );
        }
      }
    }

    // Set demoMode to false for live API completions
    parsedData.demoMode = false;

    // Strict Zod schema validation
    return ScopeProposalSchema.parse(parsedData);
  } finally {
    clearTimeout(timeoutId);
  }
}
