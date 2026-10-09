import { describe, expect, it, vi } from 'vitest';
import { FormEngine } from '../../src/engine';
import type { FormDefinition } from '../../src';
import { onExtras } from './form-engine-skip.fixtures';

function endingDefinition(): FormDefinition {
  return {
    id: 'ending',
    title: 'Ending',
    submit: { label: 'Submit' },
    steps: [
      {
        id: 'kind',
        title: 'Kind',
        skip: { label: 'Skip' },
        fields: [{ key: 'kind', type: 'text', label: 'Kind', defaultValue: 'done' }],
        routes: [{ to: null, show: [{ field: 'kind', eq: 'done' }] }],
      },
      { id: 'details', title: 'Details', fields: [{ key: 'details', type: 'text', label: 'Details' }] },
    ],
  };
}

async function filledExtras(options = {}) {
  const engine = await onExtras(options);
  engine.setValue('phone', '555');
  return engine;
}

describe('FormEngine skip guards', () => {
  it('keeps values and the step when onBeforeStepChange cancels a skip', async () => {
    const onBeforeStepChange = vi.fn(({ reason }: { reason: string }) => reason !== 'skip');
    const engine = await filledExtras({ onBeforeStepChange });
    expect(await engine.skipStepAsync()).toBe(false);
    expect(onBeforeStepChange).toHaveBeenLastCalledWith(expect.objectContaining({
      reason: 'skip', toStepId: 'notes', values: { name: 'Ada', phone: '555', plan: 'free' },
    }));
    expect(engine.values.phone).toBe('555');
    expect(engine.isStepSkipped('extras')).toBe(false);
    expect(engine.getSubmitValues().phone).toBe('555');
  });

  it('keeps values and the step when a skip goes stale', async () => {
    let release!: () => void;
    const onBeforeStepChange = ({ reason }: { reason: string }) => (reason === 'skip' ? new Promise<void>((resolve) => { release = resolve; }) : undefined);
    const engine = await filledExtras({ onBeforeStepChange });
    const pending = engine.skipStepAsync();
    engine.cancelPendingActions();
    release();
    expect(await pending).toBe(false);
    expect(engine.values.phone).toBe('555');
    expect(engine.isStepSkipped('extras')).toBe(false);
  });

  it('keeps the last step when onBeforeSubmit cancels a skip', async () => {
    const engine = await filledExtras({ onBeforeSubmit: () => false });
    await engine.nextStepAsync();
    engine.setValue('notes', 'draft');
    const submit = vi.fn();
    expect(await engine.skipStepAsync(submit)).toBe(false);
    expect(submit).not.toHaveBeenCalled();
    expect(engine.values.notes).toBe('draft');
    expect(engine.isStepSkipped('notes')).toBe(false);
  });

  it('includes a skipped step again when one of its fields changes', async () => {
    const engine = await filledExtras();
    await engine.skipStepAsync();
    await engine.prevStepAsync();
    engine.setValue('phone', '777');
    expect(engine.isStepSkipped('extras')).toBe(false);
    expect(engine.getSubmitValues().phone).toBe('777');
  });

  it('refuses a skip that would end the form without a submit handler', async () => {
    const engine = new FormEngine(endingDefinition(), { kind: 'more' });
    expect(engine.skipStep()).toBe(false);
    expect(await engine.skipStepAsync()).toBe(false);
    expect(engine.values.kind).toBe('more');
    expect(engine.isStepSkipped('kind')).toBe(false);
  });

  it('submits when the reset values end the form', async () => {
    const engine = new FormEngine(endingDefinition(), { kind: 'more' });
    const submit = vi.fn();
    expect(await engine.skipStepAsync(submit)).toBe(true);
    expect(submit).toHaveBeenCalledWith({});
    expect(engine.isStepSkipped('kind')).toBe(true);
  });
});
