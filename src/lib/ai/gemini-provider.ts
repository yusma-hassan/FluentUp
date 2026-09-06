import { GoogleGenAI } from '@google/genai';
import type { Evaluation, EvaluationResult } from '@/types/index';
import type { AIProvider, AIEvaluationRequest } from './types';
import { buildEvaluationPrompt } from './prompt-builder';

// ── Prompt builder (re-exported for Property 5 test) ─────────────────────────
export { buildEvaluationPrompt } from './prompt-builder';

// ── Score bounds validator (exported for Property 4 test) ────────────────────
export { validateScoreBounds } from './score-validator';

// ── Dev-only safe logger ──────────────────────────────────────────────────────
// Only runs in development. Never logs the API key, auth headers, or request body.

function devLog(tag: string, data: Record<string, unknown>): void {
  if (process.env.NODE_ENV !== 'production') {
    console.error(`[GeminiProvider:${tag}]`, JSON.stringify(data, null, 2));
  }
}

// ── Schema validator ──────────────────────────────────────────────────────────

// Returns null on success, or a string describing the first failing field.
function isIntegerScore(value: unknown): boolean {
  return (
    typeof value === 'number' &&
    Number.isInteger(value) &&
    value >= 0 &&
    value <= 100
  );
}

function validateEvaluationSchema(
  obj: unknown,
): string | null {
  if (
    typeof obj !== 'object' ||
    obj === null ||
    Array.isArray(obj)
  ) {
    return 'root is not an object';
  }

  const e = obj as Record<string, unknown>;

  if (!isIntegerScore(e.overallScore)) {
    return 'overallScore: expected integer 0-100';
  }

  if (!Array.isArray(e.categoryScores)) {
    return 'categoryScores: not an array';
  }

  for (
    let i = 0;
    i < e.categoryScores.length;
    i++
  ) {
    const cs = e.categoryScores[i];

    if (
      typeof cs !== 'object' ||
      cs === null ||
      Array.isArray(cs)
    ) {
      return `categoryScores[${i}]: not an object`;
    }

    const s = cs as Record<string, unknown>;

    if (typeof s.criterionId !== 'string') {
      return (
        `categoryScores[${i}].criterionId: ` +
        'expected string'
      );
    }

    if (typeof s.label !== 'string') {
      return (
        `categoryScores[${i}].label: ` +
        'expected string'
      );
    }

    if (!isIntegerScore(s.score)) {
      return (
        `categoryScores[${i}].score: ` +
        'expected integer 0-100'
      );
    }
  }

  if (!Array.isArray(e.strengths)) {
    return 'strengths: not an array';
  }

  if (
    e.strengths.length < 1 ||
    e.strengths.length > 5
  ) {
    return (
      `strengths: length ${e.strengths.length} ` +
      'outside [1,5]'
    );
  }

  if (
    !e.strengths.every(
      (s) =>
        typeof s === 'string' &&
        s.trim().length > 0,
    )
  ) {
    return 'strengths: contains invalid string';
  }

  if (!Array.isArray(e.weaknesses)) {
    return 'weaknesses: not an array';
  }

  if (
    e.weaknesses.length < 1 ||
    e.weaknesses.length > 5
  ) {
    return (
      `weaknesses: length ${e.weaknesses.length} ` +
      'outside [1,5]'
    );
  }

  if (
    !e.weaknesses.every(
      (s) =>
        typeof s === 'string' &&
        s.trim().length > 0,
    )
  ) {
    return 'weaknesses: contains invalid string';
  }

  if (
    typeof e.frameworkFeedback !== 'string' ||
    e.frameworkFeedback.trim() === ''
  ) {
    return 'frameworkFeedback: missing or empty string';
  }

  if (!Array.isArray(e.suggestions)) {
    return 'suggestions: not an array';
  }

  if (
    e.suggestions.length < 1 ||
    e.suggestions.length > 3
  ) {
    return (
      `suggestions: length ${e.suggestions.length} ` +
      'outside [1,3]'
    );
  }

  if (
    !e.suggestions.every(
      (s) =>
        typeof s === 'string' &&
        s.trim().length > 0,
    )
  ) {
    return 'suggestions: contains invalid string';
  }

  if (
    typeof e.exampleResponse !== 'string' ||
    e.exampleResponse.trim() === ''
  ) {
    return 'exampleResponse: missing or empty string';
  }

  return null;
}

function validateCategoryScoresAgainstCriteria(
  categoryScores: unknown[],
  criteria: AIEvaluationRequest['evaluationCriteria'],
): string | null {
  if (categoryScores.length !== criteria.length) {
    return (
      `categoryScores length ${categoryScores.length} ` +
      `does not match criteria length ${criteria.length}`
    );
  }

  for (let i = 0; i < criteria.length; i++) {
    const score = categoryScores[i];

    if (
      typeof score !== 'object' ||
      score === null ||
      Array.isArray(score)
    ) {
      return `categoryScores[${i}] is invalid`;
    }

    const item = score as Record<string, unknown>;

    if (item.criterionId !== criteria[i].id) {
      return (
        `categoryScores[${i}].criterionId does not match ` +
        `criterion ${criteria[i].id}`
      );
    }

    if (item.label !== criteria[i].label) {
      return (
        `categoryScores[${i}].label does not match ` +
        `criterion ${criteria[i].label}`
      );
    }
  }

  return null;
}

function isValidEvaluation(obj: unknown): obj is Evaluation {
  return validateEvaluationSchema(obj) === null;
}

// ── Text extraction helper ────────────────────────────────────────────────────
// The SDK's response.text getter returns `undefined` when candidates[0] has
// only thought parts (thinking models) or when the parts array is empty.
// This helper tries the getter first, then falls back to reading parts directly,
// so we get the JSON text regardless of whether thought parts are present.

type SDKResponse = {
  text?: string | undefined;
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string; thought?: boolean }> };
    finishReason?: string;
  }>;
};

function extractResponseText(response: SDKResponse): string | undefined {
  // Fast path: SDK getter works
  if (typeof response.text === 'string') return response.text;

  // Fallback: read parts directly, skip thought parts
  const parts = response.candidates?.[0]?.content?.parts;
  if (!parts || parts.length === 0) return undefined;

  const textParts = parts
    .filter((p) => typeof p.text === 'string' && !p.thought)
    .map((p) => p.text as string);

  return textParts.length > 0 ? textParts.join('') : undefined;
}

// ── GeminiProvider ────────────────────────────────────────────────────────────

export class GeminiProvider implements AIProvider {
  readonly id = 'gemini';

  async evaluate(request: AIEvaluationRequest): Promise<EvaluationResult> {
    const apiKey = process.env.AI_API_KEY;
    const model = process.env.AI_MODEL ?? 'gemini-2.5-flash';
    const timeoutMs = Number(process.env.AI_TIMEOUT_MS ?? 30_000);

    if (!apiKey) {
      return {
        success: false,
        error: { type: 'PROVIDER_ERROR', message: 'The AI service is unavailable. Please try again.' },
      };
    }

    // DEV: log audio metadata to confirm what the browser sent
    devLog('audio-meta', {
      audioMimeType: request.audioMimeType,
      audioSizeBytes: request.audioBlob.byteLength,
      frameworkId: request.frameworkId,
      topicTextLength: request.topicText.length,
    });

    const audioBase64 = Buffer.from(request.audioBlob).toString('base64');

const geminiMimeType =
  request.audioMimeType.split(';')[0].trim().toLowerCase();

devLog('audio-for-gemini', {
  originalMimeType: request.audioMimeType,
  normalizedMimeType: geminiMimeType,
  audioSizeBytes: request.audioBlob.byteLength,
});

const promptText = buildEvaluationPrompt(
      request.frameworkName,
      request.topicText,
      request.evaluationCriteria,
    );


    try {
      const genAI = new GoogleGenAI({
    apiKey,
    httpOptions: {
      timeout: timeoutMs,
    },
  });

  const response = await genAI.models.generateContent({
        model,
        contents: [
          {
            role: 'user',
            parts: [
              {
  inlineData: {
    data: audioBase64,
    mimeType: geminiMimeType,
  },
},
              { text: promptText },
            ],
          },
        ],
        config: {
          // responseSchema is intentionally NOT set here.
          //
          // When responseSchema is active, the Gemini API enforces the exact
          // field set at the wire level and CANNOT return the alternative
          // {"noSpeechDetected": true} shape needed for silent recordings.
          // The normal evaluation shape is validated post-parse by
          // validateEvaluationSchema(); the no-speech shape is checked first.
          responseMimeType: 'application/json',
        },
      });

     

      // DEV: log the raw response structure (no API key, no audio data)
      devLog('response-meta', {
        candidatesCount: response.candidates?.length ?? 0,
        finishReason: response.candidates?.[0]?.finishReason ?? 'unknown',
        partsCount: response.candidates?.[0]?.content?.parts?.length ?? 0,
        partTypes: (response.candidates?.[0]?.content?.parts ?? []).map(
          (p) => ({
            hasText: typeof p.text === 'string',
            textLength: typeof p.text === 'string' ? (p.text as string).length : 0,
            isThought: (p as Record<string, unknown>).thought === true,
          }),
        ),
        sdkTextDefined: response.text !== undefined,
        sdkTextLength: typeof response.text === 'string' ? response.text.length : null,
      });

      // Extract text — uses fallback if SDK getter returns undefined
      const rawText = extractResponseText(response as SDKResponse);
      devLog('raw-ai-response', {
  rawTextLength: rawText?.length ?? 0,
  rawTextPreview: rawText?.slice(0, 500) ?? null,
});

      if (rawText === undefined || rawText.trim() === '') {
        devLog('empty-response', {
          finishReason: response.candidates?.[0]?.finishReason ?? 'unknown',
          promptFeedback: response.promptFeedback ?? null,
        });
        return {
          success: false,
          error: {
            type: 'PROVIDER_ERROR',
            message: 'The AI service returned an empty response. Please try again.',
          },
        };
      }

      // Parse JSON
      let parsed: unknown;
      try {
        parsed = JSON.parse(rawText);
      } catch (parseErr) {
        devLog('json-parse-error', {
          rawTextLength: rawText.length,
          rawTextPreview: rawText.slice(0, 300),
          parseError: parseErr instanceof Error ? parseErr.message : String(parseErr),
        });
        return {
          success: false,
          error: {
            type: 'SCHEMA_MISMATCH',
            message: 'The AI response was not in the expected format. Please try again.',
          },
        };
      }

      // ── Second-line no-speech defense ──────────────────────────────────────
      // If Gemini signals that no human speech was present, return a structured
      // NO_SPEECH_DETECTED error instead of fabricated feedback.
      if (
        typeof parsed === 'object' &&
        parsed !== null &&
        (parsed as Record<string, unknown>).noSpeechDetected === true
      ) {
        devLog('no-speech-detected', { noSpeechDetected: true });
        return {
          success: false,
          error: {
            type: 'NO_SPEECH_DETECTED',
            message: 'No speech was detected in your recording. Please try again and speak clearly into your microphone.',
          },
        };
      }

      // Validate against Evaluation schema — log exactly which field fails
      const schemaError = validateEvaluationSchema(parsed);

if (schemaError !== null) {
  devLog('schema-validation-failed', {
    failingField: schemaError,
    parsedKeys:
      typeof parsed === 'object' && parsed !== null
        ? Object.keys(parsed as Record<string, unknown>)
        : [],
    parsedPreview:
      JSON.stringify(parsed).slice(0, 500),
  });

  return {
    success: false,
    error: {
      type: 'SCHEMA_MISMATCH',
      message:
        'The AI response was not in the expected format. Please try again.',
    },
  };
}

// Validate categoryScores against the actual framework criteria.
const categoryScoresError =
  validateCategoryScoresAgainstCriteria(
    (parsed as Record<string, unknown>).categoryScores as unknown[],
    request.evaluationCriteria,
  );

if (categoryScoresError !== null) {
  devLog('category-scores-validation-failed', {
    failingField: categoryScoresError,
  });

  return {
    success: false,
    error: {
      type: 'SCHEMA_MISMATCH',
      message:
        'The AI response was not in the expected format. Please try again.',
    },
  };
}

return {
  success: true,
  evaluation: parsed as Evaluation,
};
    } catch (err: unknown) {
      

      if (
  err instanceof Error &&
  (err.name === 'TimeoutError' || err.message?.toLowerCase().includes('timeout'))
) {
        return {
          success: false,
          error: { type: 'TIMEOUT', message: 'The AI service took too long to respond. Please try again.' },
        };
      }

      // DEV: log sanitized provider error (no API key, no auth headers)
      devLog('provider-error', {
        name: err instanceof Error ? err.name : typeof err,
        message: err instanceof Error
          ? err.message
              .replace(/key[^\s]*/gi, '[redacted]')
              .replace(/[A-Za-z0-9_\-]{30,}/g, '[redacted]')
          : String(err).slice(0, 200),
        status: (err as Record<string, unknown>).status,
        statusCode: (err as Record<string, unknown>).statusCode,
        code: (err as Record<string, unknown>).code,
      });

      return {
        success: false,
        error: { type: 'PROVIDER_ERROR', message: 'The AI service is unavailable. Please try again.' },
      };
    }
  }
}
