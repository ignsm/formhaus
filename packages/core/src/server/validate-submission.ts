import type { FormDefinition, FormField } from '../types';
import type { ValidatorFn } from '../validation';
import { getAllFields } from '../engine/engine-utils';
import type { EngineInternals } from '../engine/runtime-internals';
import { FormEngine } from '../engine/runtime';
import { skipCurrentStep } from '../engine/step-skip';
import { normalizeValue, typeError } from './type-checks';

export interface SubmissionOptions {
  skippedSteps?: string[];
}

export interface SubmissionResult {
  values: Record<string, unknown>;
  errors: Record<string, string>;
}

const allow: ValidatorFn = () => null;

function knownValues(fields: FormField[], input: unknown): Record<string, unknown> {
  const source = input !== null && typeof input === 'object' && !Array.isArray(input) ? input as Record<string, unknown> : {};
  const values: Record<string, unknown> = {};
  for (const field of fields) {
    if (Object.prototype.hasOwnProperty.call(source, field.key)) values[field.key] = normalizeValue(field, source[field.key]);
  }
  return values;
}

function ignoredValidators(fields: FormField[]): Record<string, ValidatorFn> {
  const validators: Record<string, ValidatorFn> = {};
  for (const { validation } of fields) if (validation?.validator) validators[validation.validator] = allow;
  return validators;
}

function applySkips(engine: FormEngine, skippedSteps: unknown): void {
  if (!Array.isArray(skippedSteps)) return;
  const internals = engine as unknown as EngineInternals;
  const requested = new Set(skippedSteps);
  for (let index = 0; index < engine.visibleSteps.length; index++) {
    const step = engine.visibleSteps[index];
    if (!step.skip || !requested.has(step.id)) continue;
    internals.currentStepIndex = index;
    internals.notify({ structureChanged: true });
    skipCurrentStep(internals);
  }
}

export function validateSubmission(
  definition: FormDefinition,
  input: Record<string, unknown>,
  options: SubmissionOptions = {},
): SubmissionResult {
  const fields = getAllFields(definition);
  const fieldByKey = new Map(fields.map((field) => [field.key, field]));
  const engine = new FormEngine(definition, knownValues(fields, input), { validators: ignoredValidators(fields) });
  applySkips(engine, options.skippedSteps);
  const errors = engine.validate();
  const values = engine.getSubmitValues();
  for (const [key, value] of Object.entries(values)) {
    const error = typeError(fieldByKey.get(key)!, value);
    if (error) errors[key] = error;
  }
  return { values, errors };
}
