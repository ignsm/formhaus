import { getChangedKeys } from './engine-utils';
import type { EngineInternals } from './runtime-internals';
import { reconcileStepIndex } from './step-routes';
import { pruneOffPathErrors } from './validation-state';

export function skipCurrentStep(engine: EngineInternals): boolean {
  const step = engine.currentStep;
  if (!step) return false;
  const previousSteps = engine.visibleSteps;
  const previousValues = { ...engine.values };
  const previousErrors = { ...engine.errors };
  for (const field of step.fields) {
    if (field.defaultValue === undefined) delete engine.values[field.key];
    else engine.values[field.key] = field.defaultValue;
    delete engine.errors[field.key];
  }
  engine.skippedSteps.add(step.id);
  engine.visibility.reconcileHidden(engine.values, engine.errors);
  engine.visibility.markChanged(true, true);
  engine.currentStepIndex = reconcileStepIndex(previousSteps, engine.visibleSteps, engine.currentStepIndex);
  pruneOffPathErrors(engine);
  const fieldKeys = new Set([...getChangedKeys(previousValues, engine.values), ...getChangedKeys(previousErrors, engine.errors)]);
  engine.notify({ fieldKeys, structureChanged: true, valuesChanged: true });
  return true;
}

export function includeCurrentStep(engine: EngineInternals): void {
  const step = engine.currentStep;
  if (step) engine.skippedSteps.delete(step.id);
}
