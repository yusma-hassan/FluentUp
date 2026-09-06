import type { NumberedSlot } from '@/types';

/**
 * Shuffles an array of items and assigns each a 1-based slot number.
 *
 * Requirements: 1.3 (randomized order), 1.5 (shuffled into slots), 2.1 (numbered topic slots)
 */
export function assignSlots<T>(items: T[]): NumberedSlot<T>[] {
  const shuffled = [...items].sort(() => Math.random() - 0.5);
  return shuffled.map((item, i) => ({ slot: i + 1, item }));
}
