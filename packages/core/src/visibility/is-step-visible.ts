import type { FormStep } from '../types';
import { isVisible } from './is-visible';

export function isStepVisible(step: FormStep, values: Record<string, unknown>): boolean {
  return isVisible(step, values);
}
