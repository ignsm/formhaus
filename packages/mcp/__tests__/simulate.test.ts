import { describe, expect, it } from 'vitest';
import { simulatePathTool } from '../src/simulate';
import { branching, linear, skippable } from './fixtures';

const ids = (result: Awaited<ReturnType<typeof simulatePathTool>>) => result.path?.map(({ id }) => id);

describe('simulate_path', () => {
  it('walks a linear form to submit', async () => {
    const result = await simulatePathTool({ definition: linear, answers: { name: 'Ada', email: 'ada@example.com' } });
    expect(ids(result)).toEqual(['name', 'email']);
    expect(result.currentStep).toEqual({ id: 'email', title: 'Email', index: 1 });
    expect(result.wouldSubmit).toBe(true);
    expect(result.submitValues).toEqual({ name: 'Ada', email: 'ada@example.com' });
  });

  it('stops at the first step that fails validation', async () => {
    const result = await simulatePathTool({ definition: linear, answers: {} });
    expect(result.currentStep?.id).toBe('name');
    expect(result.trace).toEqual([{ action: 'next', from: 'name', to: 'name', moved: false, errors: { name: 'This field is required' } }]);
    expect(result.wouldSubmit).toBe(false);
  });

  it('follows the first matching route', async () => {
    const result = await simulatePathTool({ definition: branching, answers: { kind: 'business', company: 'Acme' } });
    expect(ids(result)).toEqual(['kind', 'business', 'review']);
    expect(result.path?.[1].visibleFields).toEqual(['company', 'vat']);
    expect(result.submitValues).toEqual({ kind: 'business', company: 'Acme' });
    expect(result.wouldSubmit).toBe(true);
  });

  it('falls back to the unconditional route and drops off-path answers', async () => {
    const result = await simulatePathTool({ definition: branching, answers: { kind: 'personal', name: 'Ada', company: 'Acme' } });
    expect(ids(result)).toEqual(['kind', 'personal', 'review']);
    expect(result.submitValues).toEqual({ kind: 'personal', name: 'Ada' });
  });

  it('ends the path on to: null', async () => {
    const result = await simulatePathTool({ definition: branching, answers: { kind: 'none' } });
    expect(ids(result)).toEqual(['kind']);
    expect(result.trace).toEqual([]);
    expect(result.wouldSubmit).toBe(true);
  });

  it('hides fields whose conditions do not match', async () => {
    const result = await simulatePathTool({ definition: branching, answers: { kind: 'business' } });
    expect(result.path?.[1].visibleFields).toEqual(['company']);
    expect(result.currentStep?.id).toBe('business');
  });

  it('skips a step and leaves its answers out', async () => {
    const result = await simulatePathTool({ definition: skippable, answers: { bio: 'Hi', phone: '1' }, actions: ['skip'] });
    expect(result.trace?.[0]).toMatchObject({ action: 'skip', from: 'about', to: 'contact', moved: true });
    expect(result.path?.[0].skipped).toBe(true);
    expect(result.errors).toEqual({});
    expect(result.submitValues).toEqual({ phone: '1' });
  });

  it('applies back after next', async () => {
    const result = await simulatePathTool({ definition: linear, answers: { name: 'Ada' }, actions: ['next', 'back'] });
    expect(result.trace?.map(({ to }) => to)).toEqual(['email', 'name']);
    expect(result.wouldSubmit).toBe(false);
  });

  it('returns validation errors for an invalid definition', async () => {
    const result = await simulatePathTool({ definition: { id: 'x' } });
    expect(result.ok).toBe(false);
    expect(result.validation.valid).toBe(false);
  });

  it('handles single-page forms', async () => {
    const definition = { id: 'f', title: 'F', submit: { label: 'Send' }, fields: [{ key: 'a', type: 'text', label: 'A', validation: { required: true } }] };
    const result = await simulatePathTool({ definition, answers: {} });
    expect(result.multiStep).toBe(false);
    expect(result.errors).toEqual({ a: 'This field is required' });
    expect(result.wouldSubmit).toBe(false);
  });
});
