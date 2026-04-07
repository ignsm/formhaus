import { describe, expect, it } from 'vitest';
import type { FormStep } from '../../src/types';
import { isStepVisible } from '../../src/visibility';

describe('isStepVisible', () => {
  const makeStep = (overrides: Partial<FormStep> = {}): FormStep => ({
    id: 'step-1',
    title: 'Test Step',
    fields: [],
    ...overrides,
  });

  it('returns true when step has no conditions', () => {
    expect(isStepVisible(makeStep(), {})).toBe(true);
  });

  it('returns true when show conditions pass', () => {
    const step = makeStep({
      show: [{ field: 'accountType', eq: 'business' }],
    });
    expect(isStepVisible(step, { accountType: 'business' })).toBe(true);
  });

  it('returns false when show conditions fail', () => {
    const step = makeStep({
      show: [{ field: 'accountType', eq: 'business' }],
    });
    expect(isStepVisible(step, { accountType: 'personal' })).toBe(false);
  });
});
