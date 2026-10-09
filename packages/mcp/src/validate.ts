import { validateDefinition, type FormDefinition } from '@formhaus/core';
import { parseDefinition } from './definition-input';
import { createEngine } from './engine';
import { loadSchemaValidator } from './schema-validation';
import { checkStructure } from './structure';

export interface ValidationReport {
  valid: boolean;
  errors: string[];
  warnings: string[];
  schemaChecked: boolean;
}

export interface Inspection {
  report: ValidationReport;
  definition?: FormDefinition;
}

function unique(items: string[]): string[] {
  return [...new Set(items)];
}

export async function inspectDefinition(input: unknown): Promise<Inspection> {
  const parsed = parseDefinition(input);
  if (!parsed.ok) return { report: { valid: false, errors: [parsed.error], warnings: [], schemaChecked: false } };
  const schema = await loadSchemaValidator();
  const { errors, warnings } = checkStructure(parsed.value);
  errors.push(...(schema?.(parsed.value) ?? []));
  const report = (): ValidationReport => ({
    valid: errors.length === 0,
    errors: unique(errors),
    warnings: unique(warnings),
    schemaChecked: schema !== null,
  });
  if (errors.length > 0) return { report: report() };
  const definition = parsed.value as unknown as FormDefinition;
  const engine = createEngine(definition);
  if (!engine.ok) errors.push(...engine.errors);
  warnings.push(...validateDefinition(definition).filter((warning) => !errors.includes(warning)));
  return { report: report(), definition: engine.ok ? definition : undefined };
}

export async function validateDefinitionTool(input: { definition: unknown }): Promise<ValidationReport> {
  return (await inspectDefinition(input.definition)).report;
}
