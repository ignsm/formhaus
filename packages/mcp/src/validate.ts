import { validateDefinition, type FormDefinition } from '@formhaus/core';
import { parseDefinition } from './definition-input';
import { createEngine } from './engine';
import { schemaErrors } from './schema-validation';
import { checkStructure } from './structure';

export interface ValidationReport {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface Inspection {
  report: ValidationReport;
  definition?: FormDefinition;
}

function finish(errors: string[], warnings: string[]): ValidationReport {
  return { valid: errors.length === 0, errors: [...new Set(errors)], warnings: [...new Set(warnings)] };
}

export function inspectDefinition(input: unknown): Inspection {
  const parsed = parseDefinition(input);
  if (!parsed.ok) return { report: finish([parsed.error], []) };
  const invalid = schemaErrors(parsed.value);
  if (invalid.length > 0) return { report: finish(invalid, []) };
  const definition = parsed.value as unknown as FormDefinition;
  const { errors, warnings } = checkStructure(definition);
  if (errors.length > 0) return { report: finish(errors, warnings) };
  const engine = createEngine(definition);
  if (!engine.ok) errors.push(...engine.errors);
  warnings.push(...validateDefinition(definition).filter((warning) => !errors.includes(warning)));
  return { report: finish(errors, warnings), definition: engine.ok ? definition : undefined };
}

export function validateDefinitionTool(input: { definition: unknown }): ValidationReport {
  return inspectDefinition(input.definition).report;
}
