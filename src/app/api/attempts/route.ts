/**
 * POST /api/attempts
 *
 * Persists a completed challenge evaluation for the authenticated user.
 *
 * Security rules:
 * - user_id is ALWAYS derived server-side from supabase.auth.getUser().
 *   It is NEVER accepted from the request body.
 * - Unauthenticated requests are rejected with HTTP 401.
 * - Invalid payloads are rejected with HTTP 400.
 * - Supabase Row Level Security provides a second ownership enforcement
 *   layer at the database level (auth.uid() = user_id).
 *  
 * This route is intentionally separate from /api/evaluate — it does not
 * touch the Gemini evaluation pipeline in any way.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { ChallengeAttemptInsert } from '@/lib/supabase/types';
import type { CategoryScore } from '@/types';

// ── Request body type ─────────────────────────────────────────────────────────

interface AttemptRequestBody {
  frameworkId: string;
  frameworkName: string;
  topicText: string;
  overallScore: number;
  categoryScores: CategoryScore[];
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  frameworkFeedback: string;
  exampleResponse: string;
}

// ── Validation ────────────────────────────────────────────────────────────────

function isValidScore(v: unknown): v is number {
  return typeof v === 'number' && Number.isInteger(v) && v >= 0 && v <= 100;
}

function isNonEmptyString(v: unknown): v is string {
  return typeof v === 'string' && v.trim().length > 0;
}

function isStringArray(v: unknown): v is string[] {
  return Array.isArray(v) && v.every((s) => typeof s === 'string');
}

function isCategoryScoreArray(v: unknown): v is CategoryScore[] {
  if (!Array.isArray(v) || v.length === 0) return false;
  return v.every(
    (cs) =>
      typeof cs === 'object' &&
      cs !== null &&
      typeof (cs as CategoryScore).criterionId === 'string' &&
      typeof (cs as CategoryScore).label === 'string' &&
      isValidScore((cs as CategoryScore).score),
  );
}

function validateBody(body: unknown): AttemptRequestBody | string {
  if (typeof body !== 'object' || body === null) return 'Request body must be a JSON object.';

  const b = body as Record<string, unknown>;

  if (!isNonEmptyString(b.frameworkId))     return 'frameworkId is required.';
  if (!isNonEmptyString(b.frameworkName))   return 'frameworkName is required.';
  if (!isNonEmptyString(b.topicText))       return 'topicText is required.';
  if (!isValidScore(b.overallScore))        return 'overallScore must be an integer 0–100.';
  if (!isCategoryScoreArray(b.categoryScores)) return 'categoryScores must be a non-empty array of valid scores.';
  if (!isStringArray(b.strengths))          return 'strengths must be an array of strings.';
  if (!isStringArray(b.weaknesses))         return 'weaknesses must be an array of strings.';
  if (!isStringArray(b.suggestions))        return 'suggestions must be an array of strings.';
  if (!isNonEmptyString(b.frameworkFeedback)) return 'frameworkFeedback is required.';
  if (!isNonEmptyString(b.exampleResponse))   return 'exampleResponse is required.';

  return b as unknown as AttemptRequestBody;
}

// ── Handler ───────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // ── Authenticate ────────────────────────────────────────────────────────
    const supabase = await createClient();

    // getUser() validates the JWT server-side — never trust client-provided IDs
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required.' },
        { status: 401 },
      );
    }

    // ── Parse and validate body ──────────────────────────────────────────────
    let rawBody: unknown;
    try {
      rawBody = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON body.' },
        { status: 400 },
      );
    }

    const validated = validateBody(rawBody);
    if (typeof validated === 'string') {
      return NextResponse.json({ error: validated }, { status: 400 });
    }

    // ── Insert — user_id set from server-side session, never from body ───────
    const insert: ChallengeAttemptInsert = {
      user_id:            user.id,           // server-side only
      framework_id:       validated.frameworkId,
      framework_name:     validated.frameworkName,
      topic_text:         validated.topicText,
      overall_score:      validated.overallScore,
      category_scores:    validated.categoryScores,
      strengths:          validated.strengths,
      weaknesses:         validated.weaknesses,
      suggestions:        validated.suggestions,
      framework_feedback: validated.frameworkFeedback,
      example_response:   validated.exampleResponse,
    };

    const { error: dbError } = await supabase
  .from('challenge_attempts')
  .insert(insert as never);

    if (dbError) {
      // No raw DB error details reach the client
      console.error('[/api/attempts] insert error:', dbError.code, dbError.message);
      return NextResponse.json(
        { error: 'Failed to save challenge result. Please try again.' },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'An unexpected error occurred.' },
      { status: 500 },
    );
  }
}
