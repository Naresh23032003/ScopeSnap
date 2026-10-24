import { NextRequest, NextResponse } from "next/server";
import { GenerateScopeRequestSchema, ScopeProposalSchema } from "@/lib/types";
import { callGroqApi, generateDemoScope } from "@/lib/groq";

/**
 * app/api/generate-scope/route.ts
 * Next.js App Router API route for generating structured SOW scope proposals.
 * Integrates Groq Cloud LPU inference with resilient offline demo fallback.
 * Strict constraint: Zero em dashes (U+2014) anywhere in code or comments.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.json().catch(() => null);

    if (!rawBody || typeof rawBody !== "object") {
      return NextResponse.json(
        { error: "Invalid JSON request body" },
        { status: 400 }
      );
    }

    // Validate request schema
    const parsedRequest = GenerateScopeRequestSchema.safeParse(rawBody);

    if (!parsedRequest.success) {
      return NextResponse.json(
        {
          error: "Request validation failed",
          details: parsedRequest.error.errors.map((e) => e.message),
        },
        { status: 400 }
      );
    }

    const { rawNotes, projectType, currency, hourlyRate, customApiKey } = parsedRequest.data;

    // Resolve API key hierarchy: BYOK client key -> Server environment key
    const trimmedCustomKey = customApiKey?.trim();
    const serverEnvKey = process.env.GROQ_API_KEY?.trim();
    const resolvedApiKey = trimmedCustomKey && trimmedCustomKey.length > 0
      ? trimmedCustomKey
      : serverEnvKey && serverEnvKey.length > 0
      ? serverEnvKey
      : null;

    // If an API key is present, attempt live Groq LPU inference
    if (resolvedApiKey) {
      try {
        const liveProposal = await callGroqApi({
          rawNotes,
          projectType,
          currency,
          hourlyRate,
          apiKey: resolvedApiKey,
        });

        // Validate final response structure before returning
        const validatedResponse = ScopeProposalSchema.parse(liveProposal);
        return NextResponse.json(validatedResponse, { status: 200 });
      } catch (apiError: unknown) {
        // Log warning and gracefully fall back to resilient demo generator
        const errorMessage = apiError instanceof Error ? apiError.message : String(apiError);
        console.warn(`[ScopeSnap API] Groq live inference failed, invoking demo fallback: ${errorMessage}`);
      }
    }

    // Offline or key-less fallback: generate context-aware structured demo proposal
    const fallbackProposal = await generateDemoScope(rawNotes, currency, hourlyRate);
    const validatedFallback = ScopeProposalSchema.parse(fallbackProposal);

    return NextResponse.json(validatedFallback, { status: 200 });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Internal server error";
    console.error("[ScopeSnap API] Unhandled route error:", errorMsg);

    // Fail-safe: deliver demo proposal even on internal processing error
    try {
      const emergencyFallback = await generateDemoScope();
      return NextResponse.json(emergencyFallback, { status: 200 });
    } catch {
      return NextResponse.json(
        { error: "Failed to generate scope proposal" },
        { status: 500 }
      );
    }
  }
}
