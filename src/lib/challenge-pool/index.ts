import { Framework } from '../../types/index';
import { FRAMEWORKS } from './frameworks';

/**
 * Validates a Framework array at module load time.
 * Each entry is checked for all required fields. Invalid entries are logged
 * via console.error and excluded from the returned array.
 *
 * Required fields:
 *   - string fields (id, name, description): present and non-empty
 *   - array fields (structuralSteps, evaluationCriteria): present and non-empty
 *   - number fields (preparationTimeSeconds, speakingTimeSeconds): present and non-zero
 */
export function validateFrameworks(frameworks: Framework[]): Framework[] {
  const valid: Framework[] = [];

  for (const framework of frameworks) {
    const id = framework.id ?? '(unknown)';
    let isValid = true;

    const requiredStrings: (keyof Framework)[] = ['id', 'name', 'description'];
    for (const field of requiredStrings) {
      const value = framework[field];
      if (typeof value !== 'string' || value.trim() === '') {
        console.error(`Framework "${id}" has missing or empty required field: ${field}`);
        isValid = false;
      }
    }

    const requiredArrays: (keyof Framework)[] = ['structuralSteps', 'evaluationCriteria'];
    for (const field of requiredArrays) {
      const value = framework[field];
      if (!Array.isArray(value) || value.length === 0) {
        console.error(`Framework "${id}" has missing or empty required field: ${field}`);
        isValid = false;
      }
    }

    const requiredNumbers: (keyof Framework)[] = [
      'preparationTimeSeconds',
      'speakingTimeSeconds',
    ];
    for (const field of requiredNumbers) {
      const value = framework[field];
      if (typeof value !== 'number' || value === 0) {
        console.error(`Framework "${id}" has missing or zero required field: ${field}`);
        isValid = false;
      }
    }

    if (isValid) {
      valid.push(framework);
    }
  }

  return valid;
}

export const ACTIVE_FRAMEWORKS: Framework[] = validateFrameworks(FRAMEWORKS);
