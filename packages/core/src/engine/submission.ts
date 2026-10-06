import { afterCommit } from './lifecycle-error';
import type { SubmitFn } from './engine-options';
import type { EngineInternals } from './runtime-internals';
import { getSubmitValues, validateForm } from './validation-state';

export async function submitAsync(engine: EngineInternals, submit: SubmitFn): Promise<boolean> {
  if (engine.submitting || engine.stepValidating) return false;
  if (Object.keys(validateForm(engine)).length > 0) return false;
  const epoch = engine.validationEpoch;
  const operation = ++engine.operationEpoch;
  const values = getSubmitValues(engine);
  const stale = () => epoch !== engine.validationEpoch || operation !== engine.operationEpoch;
  engine.submitting = true;
  engine.notify();
  try {
    if (stale()) return false;
    if (engine.lifecycle.onBeforeSubmit) {
      const allowed = await engine.lifecycle.onBeforeSubmit(values);
      if (stale() || allowed === false) return false;
    }
    if (stale()) return false;
    await submit(values);
    if (operation !== engine.operationEpoch) return true;
    await afterCommit('afterSubmit', () => engine.lifecycle.onAfterSubmit?.(values));
    return true;
  } finally {
    if (operation === engine.operationEpoch) {
      engine.submitting = false;
      engine.notify();
    }
  }
}
