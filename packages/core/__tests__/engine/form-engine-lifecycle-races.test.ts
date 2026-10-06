import { expect, it, vi } from 'vitest';
import { FormEngine } from '../../src/engine';
import { multiStepDefinition } from './form-engine-steps.fixtures';

it.each(['step', 'submit'])('discards rejected stale %s guards', async (action) => {
  let reject!: (error: Error) => void;
  const wait = () => new Promise<void>((_resolve, fail) => { reject = fail; });
  const engine = new FormEngine(multiStepDefinition, { name: 'Ada' }, {
    onBeforeStepChange: wait, onBeforeSubmit: wait,
  });
  const pending = action === 'step' ? engine.nextStepAsync() : engine.submitAsync(() => {});
  engine.cancelPendingActions();
  reject(new Error('Old failure'));
  await expect(pending).resolves.toBe(false);
  expect(engine.submitting).toBe(false);
  expect(engine.stepValidating).toBe(false);
});

it('uses the original callbacks for an already dispatched submission', async () => {
  let resolve!: () => void;
  const calls: string[] = [];
  const options = { onAfterSubmit: () => { calls.push('A'); } };
  const engine = new FormEngine(multiStepDefinition, { name: 'Ada' }, options);
  const pending = engine.submitAsync(() => new Promise<void>((done) => { resolve = done; }));
  options.onAfterSubmit = () => { calls.push('B'); };
  resolve();
  expect(await pending).toBe(true);
  expect(calls).toEqual(['A']);
});

it('locks submission before notifying validation subscribers', async () => {
  let calls = 0;
  let attempted = false;
  const engine = new FormEngine(multiStepDefinition, { name: 'Ada' });
  const send = () => { calls++; };
  engine.subscribe(() => {
    if (attempted) return;
    attempted = true;
    void engine.submitAsync(send);
  });
  await engine.submitAsync(send);
  expect(calls).toBe(1);
});

it('keeps values written by before-hooks in the action', async () => {
  let submitted: Record<string, unknown> | undefined;
  const engine: FormEngine = new FormEngine(multiStepDefinition, { name: 'Ada' }, {
    onBeforeStepChange: async () => { engine.setValue('company', 'lead-1'); },
    onBeforeSubmit: async () => { engine.setValue('method', 'bank'); },
  });
  expect(await engine.nextStepAsync()).toBe(true);
  expect(engine.currentStep?.id).toBe('payment');
  expect(await engine.submitAsync((values) => { submitted = values; })).toBe(true);
  expect(submitted).toMatchObject({ name: 'Ada', method: 'bank' });
});

it('revalidates values changed during a before-submit hook', async () => {
  const send = vi.fn();
  const engine: FormEngine = new FormEngine(multiStepDefinition, { name: 'Ada' }, {
    onBeforeSubmit: () => { engine.setValue('name', ''); },
  });
  expect(await engine.submitAsync(send)).toBe(false);
  expect(send).not.toHaveBeenCalled();
  expect(engine.errors.name).toBeDefined();
});
