import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import type { ErrorObject, ValidateFunction } from 'ajv';

type SchemaValidator = (definition: unknown) => string[];

let cached: Promise<SchemaValidator | null> | undefined;

function readSchema(): Record<string, unknown> | null {
  try {
    const path = createRequire(import.meta.url).resolve('@formhaus/core/schema.json');
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch {
    return null;
  }
}

function formatError({ instancePath, message }: ErrorObject): string {
  return `Schema: ${instancePath || '/'} ${message ?? 'is invalid'}`;
}

async function compile(): Promise<SchemaValidator | null> {
  const schema = readSchema();
  if (!schema) return null;
  const { default: Ajv } = await import('ajv');
  const validate: ValidateFunction = new Ajv({ allErrors: true, strict: false }).compile(schema);
  return (definition) => (validate(definition) ? [] : (validate.errors ?? []).map(formatError));
}

export function loadSchemaValidator(): Promise<SchemaValidator | null> {
  cached ??= compile().catch(() => null);
  return cached;
}
