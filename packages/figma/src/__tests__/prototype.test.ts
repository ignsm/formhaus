import type { FormStep } from '@formhaus/core';
import { describe, expect, it } from 'vitest';
import { optionTargets, routeTarget } from '../flow/prototype';

const steps: FormStep[] = [
  { id: 'kind', title: 'Kind', fields: [{ key: 'kind', type: 'radio', label: 'Kind', options: [{ value: 'business', label: 'Business' }, { value: 'personal', label: 'Personal' }, { value: 'done', label: 'Nothing' }] }],
    routes: [{ to: 'business', show: [{ field: 'kind', eq: 'business' }] }, { to: null, show: [{ field: 'kind', eq: 'done' }] }] },
  { id: 'personal', title: 'Personal', fields: [{ key: 'name', type: 'text', label: 'Name' }] },
  { id: 'business', title: 'Business', fields: [{ key: 'company', type: 'text', label: 'Company' }], routes: [{ to: 'kind' }] },
];

describe('prototype targets', () => {
  it('follows the first matching route and falls through to the next step', () => {
    expect(routeTarget(steps, 0, {})).toBe('personal');
    expect(routeTarget(steps, 0, { kind: 'business' })).toBe('business');
    expect(routeTarget(steps, 0, { kind: 'done' })).toBeNull();
  });

  it('ignores backward routes and ends after the last step', () => {
    expect(routeTarget(steps, 2, {})).toBeNull();
  });

  it('maps each option of a routed radio to its destination', () => {
    expect([...optionTargets(steps, 0).get('kind')!]).toEqual([['business', 'business'], ['personal', 'personal'], ['done', null]]);
    expect(optionTargets(steps, 1).size).toBe(0);
  });
});
