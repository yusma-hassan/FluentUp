// Feature: fluentup-mvp, Property 5: Prompt derivation from criteria
//
// Property 5: AI prompt is fully derived from Framework criteria with no
// hardcoded framework names.
//
// For any Framework entry with an arbitrary evaluationCriteria array:
//   a) Every criterion.description string SHALL appear verbatim in the
//      constructed prompt.
//   b) Every criterion.label string SHALL appear verbatim in the constructed
//      prompt.
//   c) The framework name passed to the builder SHALL appear in the prompt.
//   d) The topic text passed to the builder SHALL appear in the prompt.
//   e) The source of gemini-provider.ts SHALL NOT contain any framework-id
//      literal (e.g. 'prep', 'what_so_what_now_what') inside a conditional
//      branch — i.e. the source must be free of if/switch/ternary expressions
//      that reference those ids.
//
// Validates: Requirements 7.8, 10.3

import * as fs from 'fs';
import * as path from 'path';
import * as fc from 'fast-check';
import type { EvaluationCriterion } from '@/types/index';
// Import from the standalone module — avoids pulling in @google/genai (ESM) via gemini-provider.ts.
// gemini-provider.ts re-exports this same function, satisfying the "exported for testing" requirement.
import { buildEvaluationPrompt } from '../prompt-builder';

// ── Source-text analysis ──────────────────────────────────────────────────────

/** Absolute path to the provider source file under test. */
const PROVIDER_SOURCE_PATH = path.resolve(
  __dirname,
  '../gemini-provider.ts',
);

/** Raw TypeScript source of the GeminiProvider module. */
const providerSource: string = fs.readFileSync(PROVIDER_SOURCE_PATH, 'utf8');

// ── Arbitraries ───────────────────────────────────────────────────────────────

/** Non-empty ASCII-printable string with no regex special chars (safe for includes checks). */
const safeStringArb: fc.Arbitrary<string> = fc
  .lorem({ maxCount: 6 })
  .filter((s) => s.trim().length > 0);

/** An EvaluationCriterion with non-empty id, label, and description. */
const criterionArb: fc.Arbitrary<EvaluationCriterion> = fc.record({
  id: safeStringArb,
  label: safeStringArb,
  description: safeStringArb,
});

/**
 * An array of 1–10 EvaluationCriterion values.
 * Mirrors the Framework.evaluationCriteria constraint from the type definition.
 */
const criteriaArrayArb: fc.Arbitrary<EvaluationCriterion[]> = fc.array(
  criterionArb,
  { minLength: 1, maxLength: 10 },
);

// ── Helper: strip single and double quotes around a token ─────────────────────

/**
 * Extracts all string literals that appear inside conditional constructs
 * (if / else if / switch / case / ternary `?`) from the source text.
 * The heuristic looks for the conditional keywords and collects all
 * single-quoted or double-quoted string literals on the same logical region
 * (within 120 characters) to avoid false negatives while remaining simple.
 */
function extractConditionalStringLiterals(source: string): string[] {
  // Match: conditional keyword followed (within ~120 chars) by a quoted string.
  // We use a simple, non-overlapping scan rather than a full parser.
  const conditionalPattern =
    /(?:if\s*\(|else\s+if\s*\(|switch\s*\(|case\s+|[?])[^;{}\n]{0,120}?(['"])((?:(?!\1).)*)\1/g;

  const literals: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = conditionalPattern.exec(source)) !== null) {
    literals.push(m[2]);
  }
  return literals;
}

// ── Property tests ────────────────────────────────────────────────────────────

describe('P5: Prompt derivation from criteria (property tests)', () => {

  // ── P5a: every criterion.description appears in the prompt ───────────────
  it(
    'P5a: every criterion.description appears verbatim in the built prompt',
    () => {
      fc.assert(
        fc.property(
          safeStringArb, // frameworkName
          safeStringArb, // topicText
          criteriaArrayArb,
          (frameworkName, topicText, criteria) => {
            const prompt = buildEvaluationPrompt(frameworkName, topicText, criteria);

            for (const criterion of criteria) {
              expect(prompt).toContain(criterion.description);
            }
          },
        ),
        { numRuns: 100 },
      );
    },
  );

  // ── P5b: every criterion.label appears in the prompt ─────────────────────
  it(
    'P5b: every criterion.label appears verbatim in the built prompt',
    () => {
      fc.assert(
        fc.property(
          safeStringArb,
          safeStringArb,
          criteriaArrayArb,
          (frameworkName, topicText, criteria) => {
            const prompt = buildEvaluationPrompt(frameworkName, topicText, criteria);

            for (const criterion of criteria) {
              expect(prompt).toContain(criterion.label);
            }
          },
        ),
        { numRuns: 100 },
      );
    },
  );

  // ── P5c: framework name appears in the prompt ─────────────────────────────
  it(
    'P5c: the framework name is reflected in the built prompt',
    () => {
      fc.assert(
        fc.property(
          safeStringArb,
          safeStringArb,
          criteriaArrayArb,
          (frameworkName, topicText, criteria) => {
            const prompt = buildEvaluationPrompt(frameworkName, topicText, criteria);
            expect(prompt).toContain(frameworkName);
          },
        ),
        { numRuns: 100 },
      );
    },
  );

  // ── P5d: topic text appears in the prompt ─────────────────────────────────
  it(
    'P5d: the topic text is reflected in the built prompt',
    () => {
      fc.assert(
        fc.property(
          safeStringArb,
          safeStringArb,
          criteriaArrayArb,
          (frameworkName, topicText, criteria) => {
            const prompt = buildEvaluationPrompt(frameworkName, topicText, criteria);
            expect(prompt).toContain(topicText);
          },
        ),
        { numRuns: 100 },
      );
    },
  );

  // ── P5e: prompt length grows with criteria count ──────────────────────────
  //
  // A strictly criteria-driven builder must include all criteria in the
  // output, so a larger criteria array MUST produce a longer prompt
  // (all else equal).
  it(
    'P5e: adding more criteria always produces a longer prompt',
    () => {
      fc.assert(
        fc.property(
          safeStringArb,
          safeStringArb,
          criterionArb,
          criterionArb,
          (frameworkName, topicText, c1, c2) => {
            const promptOne = buildEvaluationPrompt(frameworkName, topicText, [c1]);
            const promptTwo = buildEvaluationPrompt(frameworkName, topicText, [c1, c2]);
            expect(promptTwo.length).toBeGreaterThan(promptOne.length);
          },
        ),
        { numRuns: 100 },
      );
    },
  );

  // ── P5f: source contains no framework-id literals in conditional branches ─
  //
  // This is a static source-analysis check rather than a property over inputs.
  // It verifies that `gemini-provider.ts` does not contain 'prep' or
  // 'what_so_what_now_what' as string literals inside any if/switch/ternary
  // construct, which would violate the "no hardcoded framework names" rule
  // (Requirement 7.8).
  it(
    'P5f: gemini-provider.ts source contains no framework-id literals inside conditional branches',
    () => {
      const FORBIDDEN_IDS = ['prep', 'what_so_what_now_what'];

      const literals = extractConditionalStringLiterals(providerSource);

      for (const forbidden of FORBIDDEN_IDS) {
        const found = literals.some(
          (lit) => lit === forbidden || lit.includes(forbidden),
        );
        expect(found).toBe(false);
      }
    },
  );

  // ── P5g: prompt is a non-empty string for any valid input ─────────────────
  it(
    'P5g: buildEvaluationPrompt always returns a non-empty string',
    () => {
      fc.assert(
        fc.property(
          safeStringArb,
          safeStringArb,
          criteriaArrayArb,
          (frameworkName, topicText, criteria) => {
            const prompt = buildEvaluationPrompt(frameworkName, topicText, criteria);
            expect(typeof prompt).toBe('string');
            expect(prompt.trim().length).toBeGreaterThan(0);
          },
        ),
        { numRuns: 100 },
      );
    },
  );

  // ── P5h: different criteria arrays produce different prompts ──────────────
  //
  // Because each criterion's description is embedded, two distinct criteria
  // arrays (where at least one description differs) must produce distinct
  // prompt strings.
  it(
    'P5h: two criteria arrays that differ in at least one description produce different prompts',
    () => {
      fc.assert(
        fc.property(
          safeStringArb,
          safeStringArb,
          criterionArb,
          criterionArb,
          fc.lorem({ maxCount: 3 }).filter((s) => s.trim().length > 0),
          (frameworkName, topicText, base, _other, uniqueDesc) => {
            const c1: EvaluationCriterion = { ...base, description: uniqueDesc };
            const c2: EvaluationCriterion = {
              ...base,
              description: uniqueDesc + '_different',
            };

            const prompt1 = buildEvaluationPrompt(frameworkName, topicText, [c1]);
            const prompt2 = buildEvaluationPrompt(frameworkName, topicText, [c2]);

            expect(prompt1).not.toBe(prompt2);
          },
        ),
        { numRuns: 100 },
      );
    },
  );
});
