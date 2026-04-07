import type { FormField, FormSchema } from '@formhaus/core';

export function parseAndValidate(json: string): FormSchema {
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(json);
  } catch (_e) {
    throw new Error('Invalid JSON. Check syntax and try again.');
  }
  if (!parsed.title) {
    throw new Error("Schema must have a 'title'.");
  }
  if (!parsed.fields && !parsed.steps) {
    throw new Error("Schema must have 'fields' (single-step) or 'steps' (multi-step).");
  }
  if (!parsed.submit) {
    throw new Error("Schema must have a 'submit' action.");
  }
  return parsed as FormSchema;
}

export function countFields(schema: FormSchema): number {
  if (schema.fields) return schema.fields.length;
  return (schema.steps || []).reduce((sum, s) => sum + s.fields.length, 0);
}

export function getSteps(schema: FormSchema): { title: string; fields: FormField[] }[] {
  if (schema.steps && schema.steps.length > 0) {
    return schema.steps;
  }
  return [{ title: schema.title, fields: schema.fields || [] }];
}
