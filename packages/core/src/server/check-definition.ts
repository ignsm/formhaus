import { validateDefinition } from '../definition-validation';
import { definitionErrors } from '../engine/step-routes';
import type { FormDefinition } from '../types';

export interface DefinitionCheck {
  errors: string[];
  warnings: string[];
}

export function checkDefinition(definition: FormDefinition): DefinitionCheck {
  const errors = definitionErrors(definition);
  return { errors, warnings: validateDefinition(definition).slice(errors.length) };
}
