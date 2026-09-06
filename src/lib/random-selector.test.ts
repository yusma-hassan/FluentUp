// Feature: fluentup-mvp, Property 1: Slot shuffling completeness

import * as fc from 'fast-check';
import { assignSlots } from './random-selector';

/**
 * Validates: Requirements 1.3, 1.5, 1.7, 2.1, 2.5
 *
 * Property 1: Slot shuffling produces a valid, complete assignment
 *
 * For any array of 1–10 items, `assignSlots` must:
 *   1. Return the same number of elements as the input
 *   2. Assign slot numbers that form the set {1, 2, ..., N} with no duplicates
 *   3. Contain every input item exactly once (no drops, no additions)
 */

describe('assignSlots – Property 1: Slot shuffling completeness', () => {
  const runConfig = { numRuns: 100 };

  describe('with string arrays', () => {
    it('output length equals input length', () => {
      fc.assert(
        fc.property(
          fc.array(fc.string(), { minLength: 1, maxLength: 10 }),
          (items) => {
            const result = assignSlots(items);
            expect(result).toHaveLength(items.length);
          }
        ),
        runConfig
      );
    });

    it('slot numbers form the set {1 … N} with no duplicates', () => {
      fc.assert(
        fc.property(
          fc.array(fc.string(), { minLength: 1, maxLength: 10 }),
          (items) => {
            const result = assignSlots(items);
            const slots = result.map((s) => s.slot).sort((a, b) => a - b);
            const expected = Array.from({ length: items.length }, (_, i) => i + 1);
            expect(slots).toEqual(expected);
          }
        ),
        runConfig
      );
    });

    it('every input item appears in the output exactly once', () => {
      fc.assert(
        fc.property(
          fc.array(fc.string(), { minLength: 1, maxLength: 10 }),
          (items) => {
            const result = assignSlots(items);
            const outputItems = result.map((s) => s.item);
            // Use sorted copies so order doesn't matter
            expect([...outputItems].sort()).toEqual([...items].sort());
          }
        ),
        runConfig
      );
    });
  });

  describe('with number arrays', () => {
    it('output length equals input length', () => {
      fc.assert(
        fc.property(
          fc.array(fc.integer(), { minLength: 1, maxLength: 10 }),
          (items) => {
            const result = assignSlots(items);
            expect(result).toHaveLength(items.length);
          }
        ),
        runConfig
      );
    });

    it('slot numbers form the set {1 … N} with no duplicates', () => {
      fc.assert(
        fc.property(
          fc.array(fc.integer(), { minLength: 1, maxLength: 10 }),
          (items) => {
            const result = assignSlots(items);
            const slots = result.map((s) => s.slot).sort((a, b) => a - b);
            const expected = Array.from({ length: items.length }, (_, i) => i + 1);
            expect(slots).toEqual(expected);
          }
        ),
        runConfig
      );
    });

    it('every input item appears in the output exactly once', () => {
      fc.assert(
        fc.property(
          fc.array(fc.integer(), { minLength: 1, maxLength: 10 }),
          (items) => {
            const result = assignSlots(items);
            const outputItems = result.map((s) => s.item);
            expect([...outputItems].sort()).toEqual([...items].sort());
          }
        ),
        runConfig
      );
    });
  });

  describe('with object arrays', () => {
    // Arbitrary for simple objects with an id field to enable identity checks
    const objectArb = fc.record({
      id: fc.uuid(),
      value: fc.string(),
    });

    it('output length equals input length', () => {
      fc.assert(
        fc.property(
          fc.array(objectArb, { minLength: 1, maxLength: 10 }),
          (items) => {
            const result = assignSlots(items);
            expect(result).toHaveLength(items.length);
          }
        ),
        runConfig
      );
    });

    it('slot numbers form the set {1 … N} with no duplicates', () => {
      fc.assert(
        fc.property(
          fc.array(objectArb, { minLength: 1, maxLength: 10 }),
          (items) => {
            const result = assignSlots(items);
            const slots = result.map((s) => s.slot).sort((a, b) => a - b);
            const expected = Array.from({ length: items.length }, (_, i) => i + 1);
            expect(slots).toEqual(expected);
          }
        ),
        runConfig
      );
    });

    it('every input item appears in the output exactly once (by reference)', () => {
      fc.assert(
        fc.property(
          fc.array(objectArb, { minLength: 1, maxLength: 10 }),
          (items) => {
            const result = assignSlots(items);
            const outputItems = result.map((s) => s.item);
            // Each original object reference must appear exactly once
            for (const original of items) {
              const matches = outputItems.filter((o) => o === original);
              expect(matches).toHaveLength(1);
            }
          }
        ),
        runConfig
      );
    });
  });
});
