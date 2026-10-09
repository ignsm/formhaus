import type { EngineInternals } from './runtime-internals';

export function skipCurrentStep(engine: EngineInternals): void {
  const step = engine.currentStep;
  if (!step) return;
  const fieldKeys = step.fields.map(({ key, defaultValue }) => {
    if (defaultValue === undefined) delete engine.values[key];
    else engine.values[key] = defaultValue;
    delete engine.errors[key];
    return key;
  });
  engine.skipped.set(step.id, fieldKeys);
  engine.visibility.reconcileHidden(engine.values, engine.errors);
  engine.notify({ fieldKeys, structureChanged: true, valuesChanged: true });
}

export function includeCurrentStep(engine: EngineInternals): void {
  engine.skipped.delete(engine.currentStep?.id as string);
}
