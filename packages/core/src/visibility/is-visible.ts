import type { FormField, ShowCondition } from '../types';
import { evaluateCondition } from './evaluate-condition';

function evaluateConditions(
  conditions: ShowCondition[] | undefined,
  mode: 'and' | 'or',
  values: Record<string, unknown>,
): boolean {
  if (!conditions || conditions.length === 0) return true;

  if (mode === 'and') {
    return conditions.every((c) => evaluateCondition(c, values));
  }
  return conditions.some((c) => evaluateCondition(c, values));
}

export function isVisible(
  field: Pick<FormField, 'show' | 'showAny'>,
  values: Record<string, unknown>,
): boolean {
  const showResult = evaluateConditions(field.show, 'and', values);
  const showAnyResult = evaluateConditions(field.showAny, 'or', values);
  return showResult && showAnyResult;
}
