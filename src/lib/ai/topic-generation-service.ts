import {
  TopicGenerationRequest,
  TopicGenerationResponse,
  GeneratedTopic,
} from '@/types/index';

// ── Internal types ────────────────────────────────────────────────────────────

/** Raw shape expected from Gemini's structured JSON response. */
interface RawTopicsResponse {
  topics: Array<{ text: string }>;
}

/**
 * Injectable Gemini caller — accepts a prompt and returns raw JSON text.
 * In production this calls the real Gemini API; in tests it is replaced with
 * a stub that returns controlled payloads without any network traffic.
 */
export type GeminiCaller = (prompt: string) => Promise<string>;

// ── Default (production) Gemini caller ───────────────────────────────────────

async function defaultGeminiCaller(prompt: string): Promise<string> {
  const apiKey = process.env.AI_API_KEY;
  const model = process.env.AI_MODEL ?? 'gemini-2.5-flash';
  const timeoutMs = Number(process.env.AI_TIMEOUT_MS ?? 30_000);

  if (!apiKey) {
    throw new Error('AI_API_KEY environment variable is not set.');
  }

  try {
  const { GoogleGenAI } = await import('@google/genai');

  const genAI = new GoogleGenAI({
    apiKey,
    httpOptions: {
      timeout: timeoutMs,
    },
  });

  const response = await genAI.models.generateContent({
    model,
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    config: {
      responseMimeType: 'application/json',
    },
  });

  return response.text ?? '';
  } catch (err: unknown) {
    if (
      err instanceof Error &&
      (err.name === 'AbortError' || err.message?.includes('abort'))
    ) {
      // Surface as a typed timeout so the outer wrapper can classify it.
      throw Object.assign(new Error('TIMEOUT'), { isTimeout: true });
    }
    throw err;
  } 
}

// ── Validation helpers (exported for unit testing) ────────────────────────────

/**
 * Normalises a raw topics payload into exactly 10 `GeneratedTopic` entries.
 *
 * Rules (per design.md + Property 2):
 * - If more than 10 valid distinct topics are present, use the first 10.
 * - If fewer than 10 valid distinct topics remain after de-duplication, error.
 * - Empty or whitespace-only texts are treated as invalid.
 * - Duplicate detection is case-insensitive.
 */
export function validateAndAssignTopics(
  raw: unknown,
): TopicGenerationResponse {
  // Schema: must be { topics: Array<{ text: string }> }
  if (
    typeof raw !== 'object' ||
    raw === null ||
    !Array.isArray((raw as RawTopicsResponse).topics)
  ) {
    return {
      success: false,
      error: {
        type: 'SCHEMA_MISMATCH',
        message: 'Topic generation returned an unexpected response format. Please try again.',
      },
    };
  }

  const rawTopics = (raw as RawTopicsResponse).topics;

  // Filter to valid (non-empty text) entries.
  const validTopics = rawTopics.filter(
    (t) => typeof t.text === 'string' && t.text.trim().length > 0,
  );

  // Detect duplicates (case-insensitive); keep first occurrence only.
  const seen = new Set<string>();
  const distinctTopics = validTopics.filter((t) => {
    const key = t.text.trim().toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // After de-duplication, check for duplicates that were present in the raw list.
  const hasDuplicates = distinctTopics.length < validTopics.length;

  if (hasDuplicates && distinctTopics.length < 10) {
    return {
      success: false,
      error: {
        type: 'DUPLICATE_TOPICS',
        message:
          'Topic generation returned duplicate topics and fewer than 10 valid distinct topics remain. Please try again.',
      },
    };
  }

  if (distinctTopics.length < 10) {
    return {
      success: false,
      error: {
        type: 'INSUFFICIENT_TOPICS',
        message: `Topic generation returned fewer than 10 topics (got ${distinctTopics.length}). Please try again.`,
      },
    };
  }

  // Use exactly the first 10 (discard surplus).
  const topics: GeneratedTopic[] = distinctTopics.slice(0, 10).map((t, i) => ({
    id: `generated-${i + 1}`,
    text: t.text.trim(),
  }));

  return { success: true, result: { topics } };
}

// ── Public service function ───────────────────────────────────────────────────

/**
 * Generates exactly 10 framework-appropriate topics by calling Gemini.
 *
 * @param request   Framework context used to build the generation prompt.
 * @param caller    Optional override for the Gemini HTTP call (used in tests).
 */
export async function generateTopics(
  request: TopicGenerationRequest,
  caller: GeminiCaller = defaultGeminiCaller,
): Promise<TopicGenerationResponse> {
  const prompt = buildPrompt(request);

  let rawText: string;
  try {
    rawText = await caller(prompt);
  } catch (err: unknown) {
    if (
      err instanceof Error &&
      (err as Error & { isTimeout?: boolean }).isTimeout
    ) {
      return {
        success: false,
        error: {
          type: 'TIMEOUT',
          message: 'Topic generation timed out. Please try again.',
        },
      };
    }
    // DEV-ONLY: log sanitized provider error details server-side for debugging.
    // Never logs the API key, Authorization headers, or raw request bodies.
    if (process.env.NODE_ENV !== 'production') {
      const sanitized: Record<string, unknown> = {};
      if (err instanceof Error) {
        sanitized.name    = err.name;
        // Strip any potential key/token fragments from the message
        sanitized.message = err.message.replace(/key[^\s]*/gi, '[redacted]').replace(/[A-Za-z0-9_\-]{30,}/g, '[redacted]');
        // Capture HTTP status/code if the SDK surfaces them
        const e = err as Error & { status?: number; statusCode?: number; code?: string };
        if (e.status    !== undefined) sanitized.status     = e.status;
        if (e.statusCode !== undefined) sanitized.statusCode = e.statusCode;
        if (e.code      !== undefined) sanitized.code       = e.code;
      } else {
        sanitized.raw = String(err).slice(0, 200);
      }
      console.error('[generateTopics] provider error:', sanitized);
    }
    return {
      success: false,
      error: {
        type: 'PROVIDER_ERROR',
        message: 'The topic generation service is unavailable. Please try again.',
      },
    };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    return {
      success: false,
      error: {
        type: 'SCHEMA_MISMATCH',
        message: 'Topic generation returned an unexpected response format. Please try again.',
      },
    };
  }

  return validateAndAssignTopics(parsed);
}

// ── Prompt builder (exported for Property 5 test) ─────────────────────────────

export function buildPrompt(request: TopicGenerationRequest): string {
  const criteriaLines = request.evaluationCriteria
    .map((c) => `- ${c.label}: ${c.description}`)
    .join('\n');

  const stepsLines = request.structuralSteps
    .map((s) => `  ${s}`)
    .join('\n');

  return `You are a communication training assistant.

Generate exactly 10 diverse, thought-provoking practice topics suitable for the "${request.frameworkName}" communication framework.

Framework description: ${request.frameworkDescription}

Structural steps:
${stepsLines}

Evaluation criteria:
${criteriaLines}

Requirements:
- Provide exactly 10 topics.
- Each topic must be distinct (no duplicates).
- Topics should vary across domains: work, society, technology, personal growth, ethics, etc.
- Keep each topic concise (10–120 characters).

Respond with valid JSON in this exact format:
{ "topics": [{ "text": "..." }, { "text": "..." }, ...] }`;
}
