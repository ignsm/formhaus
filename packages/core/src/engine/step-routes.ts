import type { FormDefinition, FormStep } from '../types';
import { isStepVisible, isVisible } from '../visibility';

export function routeWarnings(definition: FormDefinition): string[] {
  const steps = definition.steps ?? [];
  if (!steps.some((step) => step.routes?.length)) return [];
  const warnings: string[] = [];
  const stepIndexes = new Map<string, number>();
  const fieldIndexes = new Map<string, number>();
  steps.forEach((step, index) => {
    if (stepIndexes.has(step.id)) warnings.push(`Invalid route definition: duplicate step id "${step.id}".`);
    stepIndexes.set(step.id, index);
    for (const field of step.fields) fieldIndexes.set(field.key, index);
  });
  steps.forEach((step, index) => {
    for (const route of step.routes ?? []) {
      const target = route.to === null ? null : stepIndexes.get(route.to);
      if (target === undefined || (target !== null && target <= index)) {
        warnings.push(`Invalid route from "${step.id}" to "${route.to}": targets must be later steps or null.`);
      }
      for (const condition of [...(route.show ?? []), ...(route.showAny ?? [])]) {
        const fieldIndex = fieldIndexes.get(condition.field);
        if (fieldIndex === undefined || fieldIndex > index) {
          warnings.push(`Invalid route on "${step.id}": condition field "${condition.field}" must belong to this or an earlier step.`);
        }
      }
    }
  });
  return warnings;
}

export function activeSteps(definition: FormDefinition, values: Record<string, unknown>): FormStep[] {
  const steps = definition.steps ?? [];
  if (!steps.some((step) => step.routes?.length)) return steps.filter((step) => isStepVisible(step, values));
  const indexes = new Map(steps.map((step, index) => [step.id, index]));
  const result: FormStep[] = [];
  const available: Record<string, unknown> = {};
  for (let index = 0; index < steps.length;) {
    const step = steps[index];
    if (!isStepVisible(step, available)) { index++; continue; }
    result.push(step);
    Object.assign(available, stepValues(step, values, available));
    const route = step.routes?.find((route) => (
      isVisible(route, available) && (route.to === null || ((indexes.get(route.to) ?? -1) > index
        && isStepVisible(steps[indexes.get(route.to)!], available)))
    ));
    if (route?.to === null) break;
    index = route ? indexes.get(route.to)! : index + 1;
  }
  return result;
}

export function reconcileStepIndex(previous: FormStep[], next: FormStep[], index: number): number {
  const previousStep = previous[index] ?? previous[previous.length - 1];
  const preserved = next.findIndex((step) => step.id === previousStep?.id);
  if (preserved !== -1) return preserved;
  const nextIds = new Map(next.map((step, index) => [step.id, index]));
  for (let before = Math.min(index - 1, previous.length - 1); before >= 0; before--) {
    const predecessor = nextIds.get(previous[before].id);
    if (predecessor !== undefined) return predecessor;
  }
  return 0;
}

function stepValues(step: FormStep, values: Record<string, unknown>, previous: Record<string, unknown>) {
  const candidates = { ...previous };
  for (const field of step.fields) candidates[field.key] = values[field.key];
  const result: Record<string, unknown> = {};
  for (const field of step.fields) {
    if (isVisible(field, candidates) && values[field.key] !== undefined) result[field.key] = values[field.key];
  }
  return result;
}

export function activeValues(definition: FormDefinition, values: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const step of activeSteps(definition, values)) Object.assign(result, stepValues(step, values, result));
  return result;
}
