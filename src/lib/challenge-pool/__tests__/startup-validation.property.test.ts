// Feature: fluentup-mvp, Property 11: Pool startup validation

import * as fc from 'fast-check';
import { validateFrameworks } from '../index';
import type { Framework, EvaluationCriterion } from '../../../types/index';

// ── Arbitraries ───────────────────────────────────────────────────────────────

/** Non-empty string (trimmed length ≥ 1) */
const nonEmptyString = fc
  .string({ minLength: 1 })
  .filter((s) => s.trim().length > 0);

/** Empty or whitespace-only string */
const emptyString = fc.oneof(
  fc.constant(''),
  fc.string({ minLength: 1, maxLength: 10 }).map((s) => ' '.repeat(s.length)),
);

/** Non-zero number (positive or negative, but not 0) */
const nonZeroNumber = fc
  .integer({ min: -1_000_000, max: 1_000_000 })
  .filter((n) => n !== 0);

/** Arbitrary EvaluationCriterion */
const evaluationCriterionArb: fc.Arbitrary<EvaluationCriterion> = fc.record({
  id: nonEmptyString,
  label: nonEmptyString,
  description: nonEmptyString,
});

/** A fully valid Framework */
const validFrameworkArb: fc.Arbitrary<Framework> = fc.record({
  id: nonEmptyString,
  name: nonEmptyString,
  description: nonEmptyString,
  structuralSteps: fc.array(nonEmptyString, { minLength: 1 }),
  evaluationCriteria: fc.array(evaluationCriterionArb, { minLength: 1 }),
  preparationTimeSeconds: nonZeroNumber,
  speakingTimeSeconds: nonZeroNumber,
});

/**
 * A Framework with exactly one required field deliberately broken.
 * Returns both the malformed object and a label indicating which field is bad.
 */
const malformedFrameworkArb: fc.Arbitrary<Framework> = fc
  .tuple(
    validFrameworkArb,
    fc.integer({ min: 0, max: 6 }), // which field to break
  )
  .map(([base, fieldIndex]) => {
    const copy = { ...base };
    switch (fieldIndex) {
      case 0: // id: empty string
        copy.id = '';
        break;
      case 1: // name: whitespace only
        copy.name = '   ';
        break;
      case 2: // description: empty string
        copy.description = '';
        break;
      case 3: // structuralSteps: empty array
        copy.structuralSteps = [];
        break;
      case 4: // evaluationCriteria: empty array
        copy.evaluationCriteria = [];
        break;
      case 5: // preparationTimeSeconds: zero
        copy.preparationTimeSeconds = 0;
        break;
      case 6: // speakingTimeSeconds: zero
        copy.speakingTimeSeconds = 0;
        break;
    }
    return copy;
  });

// ── Helper ────────────────────────────────────────────────────────────────────

/**
 * Returns true when every required field of a Framework is present and
 * non-empty/non-zero — mirrors the contract of validateFrameworks exactly.
 */
function isValidFramework(f: Framework): boolean {
  const strings: (keyof Framework)[] = ['id', 'name', 'description'];
  for (const field of strings) {
    const v = f[field];
    if (typeof v !== 'string' || v.trim() === '') return false;
  }

  const arrays: (keyof Framework)[] = ['structuralSteps', 'evaluationCriteria'];
  for (const field of arrays) {
    const v = f[field];
    if (!Array.isArray(v) || v.length === 0) return false;
  }

  const numbers: (keyof Framework)[] = ['preparationTimeSeconds', 'speakingTimeSeconds'];
  for (const field of numbers) {
    const v = f[field];
    if (typeof v !== 'number' || v === 0) return false;
  }

  return true;
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('validateFrameworks — Property 11: Pool startup validation excludes all malformed entries', () => {
  /**
   * Property 11a: Every entry returned by validateFrameworks satisfies
   * all required-field constraints (none are malformed).
   */
  it('returns only entries where every required field is present and non-empty/non-zero', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.oneof(validFrameworkArb, malformedFrameworkArb),
          { minLength: 0, maxLength: 20 },
        ),
        (frameworks) => {
          const result = validateFrameworks(frameworks);

          // Every returned entry must pass the validity predicate
          return result.every(isValidFramework);
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * Property 11b: No malformed entry ever appears in the result.
   * We tag each malformed entry before passing it in, then confirm
   * none of those tagged entries are present in the output.
   */
  it('never includes a malformed entry in the result', () => {
    fc.assert(
      fc.property(
        fc.array(malformedFrameworkArb, { minLength: 1, maxLength: 10 }),
        fc.array(validFrameworkArb, { minLength: 0, maxLength: 10 }),
        (malformed, valid) => {
          // Use a unique sentinel on each malformed entry so we can identify them
          const taggedMalformed = malformed.map((f, i) => ({
            ...f,
            _testTag: `malformed-${i}`,
          })) as Framework[];

          const mixed = [...taggedMalformed, ...valid].sort(() => 0.5 - Math.random());
          const result = validateFrameworks(mixed);

          // None of the tagged malformed entries should appear in the result
          return taggedMalformed.every(
            (bad) => !result.some((r) => (r as Framework & { _testTag?: string })._testTag === (bad as Framework & { _testTag?: string })._testTag),
          );
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * Property 11c: Every valid entry in the input appears in the result
   * (the function must not drop valid entries).
   */
  it('preserves all valid entries and drops none', () => {
    fc.assert(
      fc.property(
        fc.array(validFrameworkArb, { minLength: 1, maxLength: 10 }),
        fc.array(malformedFrameworkArb, { minLength: 0, maxLength: 10 }),
        (valid, malformed) => {
          // Tag valid entries with a unique id so we can find them in the result
          const taggedValid = valid.map((f, i) => ({
            ...f,
            id: `valid-entry-${i}-${f.id}`,
          }));

          const mixed = [...taggedValid, ...malformed].sort(() => 0.5 - Math.random());
          const result = validateFrameworks(mixed);

          // All tagged valid entries must be present in the result
          return taggedValid.every((v) => result.some((r) => r.id === v.id));
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * Property 11d: Result length equals the count of valid entries in the input.
   */
  it('result length equals the number of valid entries in the input', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.oneof(validFrameworkArb, malformedFrameworkArb),
          { minLength: 0, maxLength: 20 },
        ),
        (frameworks) => {
          const expectedCount = frameworks.filter(isValidFramework).length;
          const result = validateFrameworks(frameworks);
          return result.length === expectedCount;
        },
      ),
      { numRuns: 100 },
    );
  });
});
