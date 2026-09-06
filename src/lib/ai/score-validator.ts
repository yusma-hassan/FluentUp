import type { Evaluation } from '@/types/index';

/**
 * Returns true if `overallScore` and every `categoryScores[i].score` are in
 * the closed interval [0, 100].
 *
 * Exported as a pure, side-effect-free function so it can be property-tested
 * without importing the Gemini SDK (which is ESM-only and incompatible with
 * the Jest/CommonJS transform).
 */
export function validateScoreBounds(evaluation: Evaluation): boolean {
  if (evaluation.overallScore < 0 || evaluation.overallScore > 100) {
    return false;
  }
  for (const cs of evaluation.categoryScores) {
    if (cs.score < 0 || cs.score > 100) {
      return false;
    }
  }
  return true;
}
