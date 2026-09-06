import type { EvaluationCriterion } from '@/types/index';

/**
 * Builds the evaluation prompt from the framework's evaluation criteria.
 * Criteria are injected from the Framework Pool — no hardcoded framework names
 * or IDs are referenced here (satisfies Requirement 7.8 / Property 5).
 *
 * Exported as a standalone module so it can be imported by tests without
 * pulling in the @google/genai ESM package.
 */
export function buildEvaluationPrompt(
  frameworkName: string,
  topicText: string,
  evaluationCriteria: EvaluationCriterion[],
): string {
  const criteriaLines = evaluationCriteria
    .map((c) => `- criterionId "${c.id}", label "${c.label}": ${c.description}`)
    .join('\n');

  // Show a concrete example of the exact categoryScores array shape so the
  // model does not invent an object keyed by its own names.
  const exampleCategoryScore = evaluationCriteria[0]
    ? `{"criterionId":"${evaluationCriteria[0].id}","label":"${evaluationCriteria[0].label}","score":85}`
    : `{"criterionId":"example_id","label":"Example Label","score":85}`;

  return `You are an expert communication coach evaluating a spoken response.

Framework: ${frameworkName}
Topic: "${topicText}"

Evaluate the spoken response against these criteria:
${criteriaLines}

You MUST return a single JSON object with exactly these fields:

{
  "overallScore": <integer 0-100>,
  "categoryScores": [
    ${exampleCategoryScore},
    ... one object per criterion above, in the same order
  ],
  "strengths": ["<string>", ...],
  "weaknesses": ["<string>", ...],
  "frameworkFeedback": "<string>",
  "suggestions": ["<string>", ...],
  "exampleResponse": "<string>"
}

Rules:
- "categoryScores" MUST be a JSON array (not an object). Each element must have "criterionId" (matching one of the ids listed above), "label", and "score" (integer 0-100).
- Produce exactly one categoryScores entry per criterion, in the order listed above.
- "strengths": 1 to 5 strings.
- "weaknesses": 1 to 5 strings.
- "suggestions": 1 to 3 strings.
- "frameworkFeedback": non-empty string, framework-specific feedback.
- "exampleResponse": non-empty string, a stronger example response to the topic.
- Return JSON only. No markdown, no code fences, no explanation.

IMPORTANT — Speech detection:

First, determine whether the audio contains actual human speech.

If the audio contains clear human speech, evaluate that speech normally and return the complete evaluation JSON described above.

If the audio contains no audible human speech, return ONLY:

{"noSpeechDetected": true}

Do not fabricate scores or feedback when there is no speech.

For diagnostic purposes, if you detect human speech, base your evaluation on the actual spoken content in the audio. Do not assume that silence or background noise is speech.`;
}
